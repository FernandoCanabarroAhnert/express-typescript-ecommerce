import { CreateProductDto } from "../dto/product/create-product.dto";
import { UpdateProductDto } from "../dto/product/update-product.dto";
import { PageResponseDto } from "../../common/dto/page/page-response.dto";
import { inject, injectable } from "tsyringe";
import { PRISMA_SERVICE, REDIS_SERVICE } from "../../common/constants/services.constants";
import { ProductType } from "../types/product.type";
import { PrismaClient } from "@prisma/client";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ProductResponseDto } from "../dto/product/product-response.dto";
import { ProductMapper } from "../../common/mappers/product.mapper";
import { RedisService } from "../../common/services/redis.service";
import { PRODUCTS_CACHE_KEY } from "../../common/constants/cache-keys.constants";

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
        private readonly prisma: PrismaClient,
        @inject(REDIS_SERVICE)
        private readonly redisService: RedisService
    ) {}

    async findAll(page: number = 1, size: number = 10, sort: string = "id", order: "asc" | "desc" = "asc"): Promise<PageResponseDto<ProductResponseDto>> {
        const totalItems = await this.prisma.product.count();
        const totalPages = Math.ceil(totalItems / size);
        const products = await this.prisma.product.findMany({
            include: this.includeQuery,
            skip: (page - 1) * size,
            take: size,
            orderBy: {
                [sort]: order
            }
        }).then(items => items.map(ProductMapper.mapProductResponse));
        return new PageResponseDto<ProductResponseDto>({
            data: products,
            totalItems,
            numberOfItems: products.length,
            currentPage: page,
            totalPages
        });
    }

    async findById(id: number): Promise<ProductResponseDto> {
        const cachedProduct = await this.redisService.get<ProductResponseDto>(`${PRODUCTS_CACHE_KEY}:${id}`);
        if (cachedProduct) {
            return cachedProduct;
        }
        const product = await this.findProductById(id);
        const response = ProductMapper.mapProductResponse(product);
        await this.redisService.set(`${PRODUCTS_CACHE_KEY}:${id}`, response);
        return response;
    }

    async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
        await this.validateBrand(createProductDto.brandId);
        await this.validateCategories(createProductDto.categoriesIds);
        const { categoriesIds, ...productData } = createProductDto;
        const product = await this.prisma.product.create({
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
        return ProductMapper.mapProductResponse(product);
    }

    async update(id: number, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
        await this.findProductById(id);
        await this.validateBrand(updateProductDto.brandId);
        await this.validateCategories(updateProductDto.categoriesIds);
        const { categoriesIds, ...productData } = updateProductDto;
        await this.prisma.productCategory.deleteMany({
            where: { productId: id }
        });
        const product = await this.prisma.product.update({
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
        return ProductMapper.mapProductResponse(product);
    }

    async delete(id: number): Promise<void> {
        await this.findProductById(id);
        await this.prisma.product.delete({
            where: { id },
        });
    }

    private async findProductById(id: number): Promise<ProductType> {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: this.includeQuery
        });
        if (!product) {
            throw new NotFoundException(`Product with id ${id} not found`);
        }
        return product;
    }

    private async validateBrand(brandId: number) {
        const brandExists = await this.prisma.brand.findUnique({
            where: { id: brandId }
        });
        if (!brandExists) {
            throw new NotFoundException(`Brand with id ${brandId} not found`);
        }
    }

    private async validateCategories(categoriesIds: number[]) {
        for (const categoryId of categoriesIds) {
            const categoryExists = await this.prisma.category.findUnique({
                where: { id: categoryId }
            });
            if (!categoryExists) {
                throw new NotFoundException(`Category with id ${categoryId} not found`);
            }
        }
    }

}