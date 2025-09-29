import "reflect-metadata"

import { container } from "tsyringe";
import { ProductController } from "../../src/products/controllers/product.controller"
import { BRAND_SERVICE, CATEGORY_SERVICE, PRODUCT_SERVICE, REDIS_SERVICE } from "../../src/common/constants/services.constants";
import { PRODUCT_MOCK, PRODUCT_REQUEST_MOCK, PRODUCT_RESPONSE_MOCK } from "../mocks/products.mocks";
import { BRAND_MOCK } from "../mocks/brands.mocks";
import { CATEGORY_MOCK } from "../mocks/categories.mocks";
import { CreateProductDto } from "../../src/products/dto/product/create-product.dto";
import { UpdateProductDto } from "../../src/products/dto/product/update-product.dto";
import { BrandType } from "../../src/products/types/brand.type";
import { CategoryType } from "../../src/products/types/category.type";
import { ProductResponseDto } from "../../src/products/dto/product/product-response.dto";
import { ProductType } from "../../src/products/types/product.type";
import { PageResponseDto } from "../../src/common/dto/page/page-response.dto";
import { NotFoundException } from "../../src/common/exceptions/not-found.exception";

describe('ProductController', () => {
    let controller: ProductController;

    const productServiceMock = {
        findAll: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    }
    const brandServiceMock = {
        findAll: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    }
    const categoryServiceMock = {
        findAll: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    }
    const redisServiceMock = {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn()
    }

    const existingId = '1';
    const nonExistingId = '999';

    const reqMock = {
        params: {
            id: ''
        },
        body: {},
        query: {
            page: '1',
            size: '10',
            sort: 'name',
            order: 'asc'
        }
    } as any;

    const resMock = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
    } as any;

    const nextMock = jest.fn();

    const notFoundError = {
        status: 404,
        error: "Not Found"
    }
    const badRequestError = {
        status: 400,
        error: "Bad Request"
    }

    let productRequestMock: CreateProductDto;
    let updateProductMock: UpdateProductDto;
    let productMock: ProductType;
    let productResponseMock: ProductResponseDto;
    let brandMock: BrandType;
    let categoryMock: CategoryType;
    let paginatedProductsMock: PageResponseDto<ProductType>;

    beforeAll(() => {
        container.clearInstances();
        container.registerInstance(PRODUCT_SERVICE, productServiceMock);
        container.registerInstance(BRAND_SERVICE, brandServiceMock);
        container.registerInstance(CATEGORY_SERVICE, categoryServiceMock);
        container.registerInstance(REDIS_SERVICE, redisServiceMock);

        controller = container.resolve(ProductController);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        productRequestMock = PRODUCT_REQUEST_MOCK;
        updateProductMock = productRequestMock as UpdateProductDto;
        productMock = PRODUCT_MOCK;
        productResponseMock = PRODUCT_RESPONSE_MOCK;
        brandMock = BRAND_MOCK;
        categoryMock = CATEGORY_MOCK;
        paginatedProductsMock = {
            data: [productMock],
            numberOfItems: 1,
            totalItems: 1,
            currentPage: 1,
            totalPages: 1,
        }
    });

    describe('findAll', () => {
        it('should return paginated products', async () => {
            const expectedPageResponse = { ...paginatedProductsMock, data: [productResponseMock] };
            productServiceMock.findAll.mockResolvedValue(paginatedProductsMock);

            await controller.findAllProducts(reqMock, resMock, nextMock);
            expect(resMock.json).toHaveBeenCalledWith(expectedPageResponse);
        });
    });

    describe('findById', () => {
        it('should return a ProductResponseDto when product is found', async () => {
            reqMock.params.id = existingId;
            redisServiceMock.get.mockResolvedValue(null);
            productServiceMock.findById.mockResolvedValue(productMock);

            await controller.findById(reqMock, resMock, nextMock);
            expect(resMock.json).toHaveBeenCalledWith(productResponseMock);
        });
        it('should return a cached product if available', async () => {
            reqMock.params.id = existingId;
            redisServiceMock.get.mockResolvedValue(productResponseMock);
            await controller.findById(reqMock, resMock, nextMock);
            expect(resMock.json).toHaveBeenCalledWith(productResponseMock);
        });
        it('should throw Not Found Error if product is not found', async () => {
            reqMock.params.id = nonExistingId;
            redisServiceMock.get.mockResolvedValue(null);
            productServiceMock.findById.mockResolvedValue(null);
            await controller.findById(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
        it('should throw Bad Request Error if id is invalid', async () => {
            reqMock.params.id = '9358891hfhvajhsbvjh';
            await controller.findById(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(badRequestError));
        });
    });

    describe('create', () => {
        it('should create a product successfully', async () => {
            reqMock.body = productRequestMock;
            brandServiceMock.findById.mockResolvedValue(brandMock);
            categoryServiceMock.findById.mockResolvedValue(categoryMock);
            productServiceMock.create.mockResolvedValue(productMock);

            await controller.createProduct(reqMock, resMock, nextMock);
            expect(resMock.status).toHaveBeenCalledWith(201);
            expect(resMock.json).toHaveBeenCalledWith(productResponseMock);
        });
        it('should throw Not Found Error if brand is not found', async () => {
            reqMock.body = { ...productRequestMock, brandId: nonExistingId };
            brandServiceMock.findById.mockResolvedValue(null);
            await controller.createProduct(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
        it('should throw Not Found Error if category is not found', async () => {
            reqMock.body = { ...productRequestMock, categoriesIds: [nonExistingId] };
            brandServiceMock.findById.mockResolvedValue(brandMock);
            categoryServiceMock.findById.mockResolvedValue(null);
            await controller.createProduct(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
    });

    describe('update', () => {
        it('should update a product successfully', async () => {
            reqMock.params.id = existingId;
            reqMock.body = updateProductMock;
            brandServiceMock.findById.mockResolvedValue(brandMock);
            categoryServiceMock.findById.mockResolvedValue(categoryMock);
            productServiceMock.findById.mockResolvedValue(productMock);
            productServiceMock.update.mockResolvedValue(productMock);

            await controller.updateProduct(reqMock, resMock, nextMock);
            expect(resMock.json).toHaveBeenCalledWith(productResponseMock);
        });
        it('should throw Bad Request Error if id is invalid', async () => {
            reqMock.params.id = 'aihf987389hb1hh2j';
            await controller.updateProduct(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(badRequestError));
        });
        it('should throw Not Found Error if brand is not found', async () => {
            reqMock.params.id = existingId;
            reqMock.body = { ...updateProductMock, brandId: nonExistingId };
            brandServiceMock.findById.mockResolvedValue(null);

            await controller.updateProduct(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
        it('should throw Not Found Error if category is not found', async () => {
            reqMock.params.id = existingId;
            reqMock.body = { ...updateProductMock, categoriesIds: [nonExistingId] };
            brandServiceMock.findById.mockResolvedValue(brandMock);
            categoryServiceMock.findById.mockResolvedValue(null);

            await controller.updateProduct(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        })
        it('should throw Not Found Error if product is not found', async () => {
            reqMock.params.id = nonExistingId;
            reqMock.body = updateProductMock;
            productServiceMock.findById.mockResolvedValue(null);
            await controller.updateProduct(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
    });

    describe('delete', () => {
        it('should delete a product successfully', async () => {
            reqMock.params.id = existingId;
            productServiceMock.findById.mockResolvedValue(productMock);
            productServiceMock.delete.mockResolvedValue(productMock);
            await controller.deleteProduct(reqMock, resMock, nextMock);
            expect(productServiceMock.delete).toHaveBeenCalledWith(1);
            expect(resMock.status).toHaveBeenCalledWith(204);
            expect(resMock.send).toHaveBeenCalled();
        });
        it('should throw Not Found Error if product is not found', async () => {
            reqMock.params.id = existingId;
            productServiceMock.findById.mockResolvedValue(null);
            await controller.deleteProduct(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
        it('should throw Bad Request Error if id is invalid', async () => {
            reqMock.params.id = '812bfhja8y2bhvoi';
            await controller.deleteProduct(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(badRequestError));
        });
    });


})