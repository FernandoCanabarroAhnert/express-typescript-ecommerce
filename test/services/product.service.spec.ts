import 'reflect-metadata';

import { container } from 'tsyringe';
import { ProductService } from '../../src/products/services/product.service';
import { PRISMA_SERVICE, REDIS_SERVICE } from '../../src/common/constants/services.constants';
import { ProductType } from '../../src/products/types/product.type';
import { PRODUCT_MOCK, PRODUCT_REQUEST_MOCK, PRODUCT_RESPONSE_MOCK } from '../mocks/products.mocks';
import { CreateProductDto } from '../../src/products/dto/product/create-product.dto';
import { UpdateProductDto } from '../../src/products/dto/product/update-product.dto';
import { ProductResponseDto } from '../../src/products/dto/product/product-response.dto';
import { NotFoundException } from '../../src/common/exceptions/not-found.exception';
import { BrandType } from '../../src/products/types/brand.type';
import { CategoryType } from '../../src/products/types/category.type';
import { BRAND_MOCK } from '../mocks/brands.mocks';
import { CATEGORY_MOCK } from '../mocks/categories.mocks';

describe('ProductService', () => {
    let service: ProductService;
    const prismaMock = {
        product: {
            count: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        brand: {
            findUnique: jest.fn(),
        },
        category: {
            findUnique: jest.fn(),
        },
        productCategory: {
            deleteMany: jest.fn(),
        }
    }
    const redisServiceMock = {
        set: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
        hasKey: jest.fn(),
    }

    const existingId = 1;
    const nonExistingId = 999;
    const includeQuery = {
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
    let productMock: ProductType;
    let createProductMock: CreateProductDto;
    let updateProductMock: UpdateProductDto;
    let productResponseMock: ProductResponseDto;
    let brandMock: BrandType;
    let categoryMock: CategoryType;

    beforeAll(() => {
        container.clearInstances();
        container.registerInstance(PRISMA_SERVICE, prismaMock);
        container.registerInstance(REDIS_SERVICE, redisServiceMock);

        service = container.resolve(ProductService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        productMock = PRODUCT_MOCK;
        createProductMock = PRODUCT_REQUEST_MOCK;
        updateProductMock = createProductMock as UpdateProductDto;
        productResponseMock = PRODUCT_RESPONSE_MOCK;
        brandMock = BRAND_MOCK;
        categoryMock = CATEGORY_MOCK;
    });

    describe('findAll', () => {
        it('should return paginated products when no parameters are provided', async () => {
            const expectedPageResponse = {
                data: [productResponseMock],
                numberOfItems: 1,
                totalItems: 1,
                currentPage: 1,
                totalPages: 1,
            };
            prismaMock.product.count.mockResolvedValue(1);
            prismaMock.product.findMany.mockResolvedValue([productMock]);

            const result = await service.findAll();
            expect(result).toEqual(expectedPageResponse);
            expect(prismaMock.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
                skip: 0 * 10,
                take: 10,
                orderBy: {
                    id: 'asc'
                }
            }));
        });
        it('should return paginated products when parameters are provided', async () => {
            const expectedPageResponse = {
                data: [productResponseMock],
                numberOfItems: 1,
                totalItems: 1,
                currentPage: 2,
                totalPages: 1,
            };
            prismaMock.product.count.mockResolvedValue(1);
            prismaMock.product.findMany.mockResolvedValue([productMock]);

            const result = await service.findAll(2, 5, 'name', 'desc');
            expect(result).toEqual(expectedPageResponse);
            expect(prismaMock.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
                skip: 1 * 5,
                take: 5,
                orderBy: {
                    name: 'desc'
                }
            }));
        });
    });

    describe('findById', () => {
        it('should return a product by id', async () => {
            redisServiceMock.get.mockResolvedValue(null);
            prismaMock.product.findUnique.mockResolvedValue(productMock);
            const result = await service.findById(existingId);
            expect(result).toEqual(productResponseMock);
            expect(prismaMock.product.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: existingId },
                include: includeQuery
            }));
        });
        it('should throw NotFoundException if product not found', async () => {
            redisServiceMock.get.mockResolvedValue(null);
            prismaMock.product.findUnique.mockResolvedValue(null);
            await expect(service.findById(nonExistingId)).rejects.toThrow(NotFoundException);
        });
        it('should return a product by id from cache', async () => {
             redisServiceMock.get.mockResolvedValue(productResponseMock);
             const result = await service.findById(existingId);
             expect(result).toEqual(productResponseMock);
             expect(redisServiceMock.get).toHaveBeenCalledWith(`products:${existingId}`);
        });
    });

    describe('create', () => {
        it('should create and return a product', async () => {
            prismaMock.brand.findUnique.mockResolvedValue(brandMock);
            prismaMock.category.findUnique.mockResolvedValue(categoryMock);
            prismaMock.product.create.mockResolvedValue(productMock);
            const result = await service.create(createProductMock);
            expect(result).toEqual(productResponseMock);
            expect(prismaMock.product.create).toHaveBeenCalledWith(expect.objectContaining({
                include: includeQuery
            }));
        });
        it('should throw NotFoundException if brand not found', async () => {
            prismaMock.brand.findUnique.mockResolvedValue(null);
            await expect(service.create(createProductMock)).rejects.toThrow(NotFoundException);
        });
        it('should throw NotFoundException if category not found', async () => {
            prismaMock.brand.findUnique.mockResolvedValue(brandMock);
            prismaMock.category.findUnique.mockResolvedValue(null);
            await expect(service.create(createProductMock)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update and return a product when categories are provided', async () => {
            prismaMock.product.findUnique.mockResolvedValue(productMock);
            prismaMock.brand.findUnique.mockResolvedValue(brandMock);
            prismaMock.category.findUnique.mockResolvedValue(categoryMock);
            prismaMock.productCategory.deleteMany.mockResolvedValue({ count: 1 });
            prismaMock.product.update.mockResolvedValue(productMock);
            const result = await service.update(existingId, updateProductMock);
            expect(result).toEqual(productResponseMock);
            expect(prismaMock.product.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: existingId },
                include: includeQuery
            }));
        });
        it('should throw NotFoundException if product to update not found', async () => {
            prismaMock.product.findUnique.mockResolvedValue(null);
            await expect(service.update(nonExistingId, updateProductMock)).rejects.toThrow(NotFoundException);
        })
        it('should throw NotFoundException if brand not found', async () => {
            prismaMock.product.findUnique.mockResolvedValue(productMock);
            prismaMock.brand.findUnique.mockResolvedValue(null);
            await expect(service.update(nonExistingId, updateProductMock)).rejects.toThrow(NotFoundException);
        });
        it('should throw NotFoundException if category not found', async () => {
            prismaMock.product.findUnique.mockResolvedValue(productMock);
            prismaMock.brand.findUnique.mockResolvedValue(brandMock);
            prismaMock.category.findUnique.mockResolvedValue(null);
            await expect(service.update(nonExistingId, updateProductMock)).rejects.toThrow(NotFoundException);
        });
    })

    describe('delete', () => {
        it('should throw no exception when product it is deleted', async () => {
            prismaMock.product.findUnique.mockResolvedValue(productMock);
            prismaMock.product.delete.mockResolvedValue(productMock);
            await service.delete(existingId);
            expect(prismaMock.product.delete).toHaveBeenCalledWith({
                where: { id: existingId }
            });
        });
        it('should throw NotFoundException if product not found', async () => {
            prismaMock.product.delete.mockResolvedValue(null);
            await expect(service.delete(nonExistingId)).rejects.toThrow(NotFoundException);
        });
    });

})