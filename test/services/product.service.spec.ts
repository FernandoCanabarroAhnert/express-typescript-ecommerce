import 'reflect-metadata';

import { container } from 'tsyringe';
import { ProductService } from '../../src/services/product.service';
import { PRISMA_SERVICE } from '../../src/constants/services.constants';
import { ProductType } from '../../src/types/product.type';
import { PRODUCT_MOCK, PRODUCT_REQUEST_MOCK } from '../mocks/products.mocks';
import { CreateProductDto } from '../../src/dto/product/create-product.dto';
import { UpdateProductDto } from '../../src/dto/product/update-product.dto';

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
        productCategory: {
            deleteMany: jest.fn(),
        }
    }

    const existingId = 1;
    const nonExistingId = 999;
    const includeQuery = {
        brand: {
            select: {
                id: true,
                name: true,
                description: true
            }
        },
        categories: {
            select: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                }
            }
        }
    }
    let productMock: ProductType;
    let createProductMock: CreateProductDto;
    let updateProductMock: UpdateProductDto;

    beforeAll(() => {
        container.clearInstances();
        container.registerInstance(PRISMA_SERVICE, prismaMock);

        service = container.resolve(ProductService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        productMock = PRODUCT_MOCK;
        createProductMock = PRODUCT_REQUEST_MOCK;
        updateProductMock = createProductMock as UpdateProductDto;
    });

    describe('findAll', () => {
        it('should return paginated products when no parameters are provided', async () => {
            const expectedPageResponse = {
                data: [productMock],
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
                data: [productMock],
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
            prismaMock.product.findUnique.mockResolvedValue(productMock);
            const result = await service.findById(existingId);
            expect(result).toEqual(productMock);
            expect(prismaMock.product.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: existingId },
                include: includeQuery
            }));
        });
        it('should return null if product not found', async () => {
            prismaMock.product.findUnique.mockResolvedValue(null);
            const result = await service.findById(nonExistingId);
            expect(result).toBeNull();
            expect(prismaMock.product.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: nonExistingId },
                include: includeQuery
            }));
        });
    });

    describe('create', () => {
        it('should create and return a product', async () => {
            prismaMock.product.create.mockResolvedValue(productMock);
            const result = await service.create(createProductMock);
            expect(result).toEqual(productMock);
            expect(prismaMock.product.create).toHaveBeenCalledWith(expect.objectContaining({
                include: includeQuery
            }));
        });
    });

    describe('update', () => {
        it('should update and return a product when categories are provided', async () => {
            prismaMock.productCategory.deleteMany.mockResolvedValue({ count: 1 });
            prismaMock.product.update.mockResolvedValue(productMock);
            const result = await service.update(existingId, updateProductMock);
            expect(result).toEqual(productMock);
            expect(prismaMock.product.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: existingId },
                include: includeQuery
            }));
        });
    })

    describe('delete', () => {
        it('should return product when it is deleted', async () => {
            prismaMock.product.delete.mockResolvedValue(productMock);
            const result = await service.delete(existingId);
            expect(result).toEqual(productMock);
            expect(prismaMock.product.delete).toHaveBeenCalledWith({
                where: { id: existingId },
                include: includeQuery
            })
        });
        it('should return null if product not found', async () => {
            prismaMock.product.delete.mockResolvedValue(null);
            const result = await service.delete(nonExistingId);
            expect(result).toBeNull();
            expect(prismaMock.product.delete).toHaveBeenCalledWith({
                where: { id: nonExistingId },
                include: includeQuery
            })
        });
    });

})