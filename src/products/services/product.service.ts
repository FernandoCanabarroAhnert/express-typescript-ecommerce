import { CreateProductDto } from "../dto/product/create-product.dto";
import { UpdateProductDto } from "../dto/product/update-product.dto";
import { PageResponseDto } from "../../common/dto/page/page-response.dto";
import { inject, injectable } from "tsyringe";
import { PRISMA_SERVICE } from "../../common/constants/services.constants";
import { ProductType } from "../types/product.type";
import { PrismaClient } from "@prisma/client";

@injectable()
export class ProductService {

    private readonly includeQuery = {
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

    constructor(
        @inject(PRISMA_SERVICE)
        private readonly prisma: PrismaClient
    ) {}

    async findAll(page: number = 1, size: number = 10, sort: string = "id", order: "asc" | "desc" = "asc"): Promise<PageResponseDto<ProductType>> {
        const totalItems = await this.prisma.product.count();
        const totalPages = Math.ceil(totalItems / size);
        const products = await this.prisma.product.findMany({
            include: this.includeQuery,
            skip: (page - 1) * size,
            take: size,
            orderBy: {
                [sort]: order
            }
        });
        return new PageResponseDto<ProductType>({
            data: products,
            totalItems,
            numberOfItems: products.length,
            currentPage: page,
            totalPages
        });
    }

    async findById(id: number): Promise<ProductType | null> {
        return await this.prisma.product.findUnique({
            where: { id },
            include: this.includeQuery
        });
    }

    async create(createProductDto: CreateProductDto): Promise<ProductType> {
        const { categoriesIds, ...productData } = createProductDto;
        return await this.prisma.product.create({
            data: {
                ...productData,
                categories: {
                    create: categoriesIds.map(categoryId => ({
                        category: {
                            connect: { id: categoryId }
                        }
                    }))
                }
            },
            include: this.includeQuery
        });
    }

    async update(id: number, updateProductDto: UpdateProductDto): Promise<ProductType> {
        const { categoriesIds, ...productData } = updateProductDto;
        await this.prisma.productCategory.deleteMany({
            where: { productId: id }
        });
        return await this.prisma.product.update({
            where: { id },
            data: {
                ...productData,
                categories: {
                    create: categoriesIds.map(categoryId => ({
                        category: {
                            connect: { id: categoryId }
                        }
                    }))
                }
            },
            include: this.includeQuery
        });
    }

    async delete(id: number): Promise<ProductType | null> {
        return await this.prisma.product.delete({
            where: { id },
            include: this.includeQuery
        });
    }

}