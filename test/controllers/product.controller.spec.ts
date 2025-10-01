import "reflect-metadata"

import { container } from "tsyringe";
import { ProductController } from "../../src/products/controllers/product.controller"
import { PRODUCT_SERVICE } from "../../src/common/constants/services.constants";
import { PRODUCT_REQUEST_MOCK, PRODUCT_RESPONSE_MOCK } from "../mocks/products.mocks";
import { CreateProductDto } from "../../src/products/dto/product/create-product.dto";
import { UpdateProductDto } from "../../src/products/dto/product/update-product.dto";
import { ProductResponseDto } from "../../src/products/dto/product/product-response.dto";
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
    let updateProductResponseMock: UpdateProductDto;
    let productResponseMock: ProductResponseDto;
    let paginatedProductsMock: PageResponseDto<ProductResponseDto>;

    beforeAll(() => {
        container.clearInstances();
        container.registerInstance(PRODUCT_SERVICE, productServiceMock);

        controller = container.resolve(ProductController);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        productRequestMock = PRODUCT_REQUEST_MOCK;
        updateProductResponseMock = productRequestMock as UpdateProductDto;
        productResponseMock = PRODUCT_RESPONSE_MOCK;
        paginatedProductsMock = {
            data: [productResponseMock],
            numberOfItems: 1,
            totalItems: 1,
            currentPage: 1,
            totalPages: 1,
        }
    });

    describe('findAll', () => {
        it('should return paginated products', async () => {
            productServiceMock.findAll.mockResolvedValue(paginatedProductsMock);
            await controller.findAllProducts(reqMock, resMock, nextMock);
            expect(resMock.json).toHaveBeenCalledWith(paginatedProductsMock);
        });
    });

    describe('findById', () => {
        it('should return a ProductResponseDto when product is found', async () => {
            reqMock.params.id = existingId;
            productServiceMock.findById.mockResolvedValue(productResponseMock);

            await controller.findById(reqMock, resMock, nextMock);
            expect(resMock.json).toHaveBeenCalledWith(productResponseMock);
        });
        it('should throw Not Found Error if product is not found', async () => {
            reqMock.params.id = nonExistingId;
            productServiceMock.findById = jest.fn(() => {
                return Promise.reject(new NotFoundException('Product not found'));
            });
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
            productServiceMock.create.mockResolvedValue(productResponseMock);

            await controller.createProduct(reqMock, resMock, nextMock);
            expect(resMock.status).toHaveBeenCalledWith(201);
            expect(resMock.json).toHaveBeenCalledWith(productResponseMock);
        });
        it('should throw Not Found Error if brand is not found', async () => {
            productServiceMock.create = jest.fn(() => {
                return Promise.reject(new NotFoundException('Brand not found'));
            });
            reqMock.body = { ...productRequestMock, brandId: nonExistingId };
            await controller.createProduct(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
        it('should throw Not Found Error if category is not found', async () => {
            productServiceMock.create = jest.fn(() => {
                return Promise.reject(new NotFoundException('Category not found'));
            });
            reqMock.body = { ...productRequestMock, categoriesIds: [nonExistingId] };
            await controller.createProduct(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
    });

    describe('update', () => {
        it('should update a product successfully', async () => {
            reqMock.params.id = existingId;
            reqMock.body = updateProductResponseMock;
            productServiceMock.findById.mockResolvedValue(productResponseMock);
            productServiceMock.update.mockResolvedValue(productResponseMock);

            await controller.updateProduct(reqMock, resMock, nextMock);
            expect(resMock.json).toHaveBeenCalledWith(productResponseMock);
        });
        it('should throw Bad Request Error if id is invalid', async () => {
            reqMock.params.id = 'aihf987389hb1hh2j';
            await controller.updateProduct(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(badRequestError));
        });
        it('should throw Not Found Error if brand is not found', async () => {
            productServiceMock.update = jest.fn(() => {
                return Promise.reject(new NotFoundException('Brand not found'));
            });
            reqMock.params.id = existingId;
            reqMock.body = { ...updateProductResponseMock, brandId: nonExistingId };

            await controller.updateProduct(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
        it('should throw Not Found Error if category is not found', async () => {
            productServiceMock.update = jest.fn(() => {
                return Promise.reject(new NotFoundException('Category not found'));
            });
            reqMock.params.id = existingId;
            reqMock.body = { ...updateProductResponseMock, categoriesIds: [nonExistingId] };

            await controller.updateProduct(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        })
        it('should throw Not Found Error if product is not found', async () => {
            productServiceMock.update = jest.fn(() => {
                return Promise.reject(new NotFoundException('Product not found'));
            });
            reqMock.params.id = nonExistingId;
            reqMock.body = updateProductResponseMock;
            productServiceMock.findById.mockResolvedValue(null);
            await controller.updateProduct(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
    });

    describe('delete', () => {
        it('should delete a product successfully', async () => {
            reqMock.params.id = existingId;
            productServiceMock.delete.mockResolvedValue(productResponseMock);
            await controller.deleteProduct(reqMock, resMock, nextMock);
            expect(productServiceMock.delete).toHaveBeenCalledWith(1);
            expect(resMock.status).toHaveBeenCalledWith(204);
            expect(resMock.send).toHaveBeenCalled();
        });
        it('should throw Not Found Error if product is not found', async () => {
            reqMock.params.id = nonExistingId;
            productServiceMock.delete = jest.fn(() => {
                return Promise.reject(new NotFoundException('Product not found'));
            });
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