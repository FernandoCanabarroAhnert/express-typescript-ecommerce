import { inject, injectable } from "tsyringe";
import { AUTH_SERVICE, PRISMA_SERVICE, PRODUCT_SERVICE } from "../../common/constants/services.constants";
import { PrismaClient } from "@prisma/client";
import { CreateOrderDto } from "../dto/create-order.dto";
import { UserType } from "../../auth/types/user.type";
import { ProductService } from "../../products/services/product.service";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { OrderDetailsType } from "../types/order-details.type";
import { OrderMapper } from "../../common/mappers/order.mapper";
import { OrderDetailsResponseDto } from "../dto/order-details-response.dto";
import { PageResponseDto } from "../../common/dto/page/page-response.dto";
import { OrderMinResponseDto } from "../dto/order-min-response.dto";
import { AuthService } from "../../auth/services/auth.service";

@injectable()
export class OrderService {

    private readonly includeDetailsQuery = {
        user: {
            select: {
                id: true,
                fullName: true,
                email: true,
                password: true,
                cpf: true,
                birthDate: true,
                createdAt: true,
                updatedAt: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                authority: true
                            }
                        }
                    }
                }
            }
        },
        product: {
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                createdAt: true,
                updatedAt: true,
                brandId: true,
                brand: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        createdAt: true,
                        updatedAt: true
                    }
                },
                categories: {
                    select: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                createdAt: true,
                                updatedAt: true
                            }
                        }
                    }
                }
            }
        }
    }

    private includeMinQuery = {
        id: true,
        amount: true,
        moment: true,
        user: {
            select: {
                id: true,
                fullName: true,
                email: true
            }
        }
    }

    constructor(
        @inject(PRISMA_SERVICE)
        private readonly prisma: PrismaClient,
        @inject(PRODUCT_SERVICE)
        private readonly productService: ProductService,
        @inject(AUTH_SERVICE)
        private readonly authService: AuthService
    ) { }

    async findAll(page: number = 1, size: number = 10, sort: string = "id", order: "asc" | "desc" = "asc"): Promise<PageResponseDto<OrderMinResponseDto>> {
        const totalItems = await this.prisma.order.count();
        const totalPages = Math.ceil(totalItems / size);
        const orders = await this.prisma.order.findMany({
            select: this.includeMinQuery,
            skip: (page - 1) * size,
            take: size,
            orderBy: {
                [sort]: order
            }
        }).then(orders => orders.map(OrderMapper.mapOrderMinResponse));
        return new PageResponseDto<OrderMinResponseDto>({
            data: orders,
            totalItems,
            totalPages,
            numberOfItems: orders.length,
            currentPage: page
        })
    }

    async findById(id: number, user: UserType): Promise<OrderDetailsResponseDto> {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: this.includeDetailsQuery.user,
                items: { include: { product: this.includeDetailsQuery.product } },
            }
        });
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        this.authService.isAdminOrResourceOwner(user, order.userId);
        return OrderMapper.mapOrderDetailsResponse(order)
    }

    async create(createOrderDto: CreateOrderDto, user: UserType): Promise<OrderDetailsResponseDto> {
        const itemsWithProduct = await Promise.all(
            createOrderDto.items.map(async item => {
                const product = await this.productService.findById(item.productId);
                if (!product) {
                    throw new NotFoundException(`Product with ID ${item.productId} not found`);
                }
                return {
                    product,
                    quantity: item.quantity,
                    subTotal: Number(product.price.toString()) * item.quantity
                };
            })
        );
        const amount = itemsWithProduct.reduce((acc, i) => acc + i.subTotal, 0);
        const order: OrderDetailsType = await this.prisma.order.create({
            data: {
                userId: user.id,
                amount,
                items: {
                    create: itemsWithProduct.map(i => ({
                        productId: i.product.id,
                        quantity: i.quantity,
                        price: i.product.price
                    }))
                }
            },
            include: {
                user: this.includeDetailsQuery.user,
                items: { include: { product: this.includeDetailsQuery.product } }
            }
        });
        return OrderMapper.mapOrderDetailsResponse(order);
    }

}