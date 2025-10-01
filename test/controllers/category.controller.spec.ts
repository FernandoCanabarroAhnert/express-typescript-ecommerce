import "reflect-metadata";

import { CategoryController } from '../../src/products/controllers/category.controller';
import { container } from 'tsyringe';
import { CATEGORY_SERVICE } from '../../src/common/constants/services.constants';
import { UpdateCategoryDto } from "../../src/products/dto/category/update-category.dto";
import { CATEGORY_REQUEST_MOCK, CATEGORY_RESPONSE_MOCK } from '../mocks/categories.mocks';
import { PageResponseDto } from "../../src/common/dto/page/page-response.dto";
import { CategoryResponseDto } from "../../src/products/dto/category/category-response.dto";
import { CreateCategoryDto } from "../../src/products/dto/category/create-category.dto";
import { NotFoundException } from "../../src/common/exceptions/not-found.exception";

describe('CategoryController', () => {
    let controller: CategoryController;

    const CategoryServiceMock = {
        findAll: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    }

    const existingId = '1';
    const nonExistingId = '999';
    const notFoundError = {
        status: 404,
        error: "Not Found"
    }
    const badRequestError = {
        status: 400,
        error: "Bad Request"
    }
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

    let createCategoryMock: CreateCategoryDto;
    let updateCategoryMock: UpdateCategoryDto;
    let CategoryResponseMock: CategoryResponseDto;
    let paginatedCategorysMock: PageResponseDto<CategoryResponseDto>;

    beforeAll(() => {
        container.registerInstance(CATEGORY_SERVICE, CategoryServiceMock);

        controller = container.resolve(CategoryController);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        createCategoryMock = CATEGORY_REQUEST_MOCK;
        updateCategoryMock = createCategoryMock as UpdateCategoryDto;
        CategoryResponseMock = CATEGORY_RESPONSE_MOCK;
        paginatedCategorysMock = {
            data: [CategoryResponseMock],
            numberOfItems: 1,
            totalItems: 1,
            currentPage: 1,
            totalPages: 1
        }
    });

    describe('findAll', () => {
        it('should return paginated Categorys', async () => {
            CategoryServiceMock.findAll.mockResolvedValue(paginatedCategorysMock);
            await controller.findAll(reqMock, resMock, nextMock);
            expect(resMock.json).toHaveBeenCalledWith(paginatedCategorysMock);
        });
    });

    describe('findById', () => {
        it('should return a Category if id exists', async () => {
            reqMock.params.id = existingId;
            CategoryServiceMock.findById.mockResolvedValue(CategoryResponseMock);
            await controller.findById(reqMock, resMock, nextMock);
            expect(resMock.json).toHaveBeenCalledWith(CategoryResponseMock);
        });
        it('should throw BadRequestException if id is not a number', async () => {
            reqMock.params.id = 'ahdjahjhjahf';
            await controller.findById(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(badRequestError));
        });
        it('should throw NotFoundException if id does not exist', async () => {
            reqMock.params.id = nonExistingId;
            CategoryServiceMock.findById = jest.fn(() => {
                return Promise.reject(new NotFoundException('Category not found'));
            });
            await controller.findById(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
    });

    describe('create', () => {
        it('should create and return the new Category', async () => {
            reqMock.body = createCategoryMock;
            CategoryServiceMock.create.mockResolvedValue(CategoryResponseMock);
            await controller.createCategory(reqMock, resMock, nextMock);
            expect(CategoryServiceMock.create).toHaveBeenCalledWith(createCategoryMock);
            expect(resMock.status).toHaveBeenCalledWith(201);
        });
    });

    describe('update', () => {
        it('should update and return the updated Category if id exists', async () => {
            reqMock.params.id = existingId;
            reqMock.body = updateCategoryMock;
            CategoryServiceMock.update.mockResolvedValue(CategoryResponseMock);
            await controller.updateCategory(reqMock, resMock, nextMock);
            expect(CategoryServiceMock.update).toHaveBeenCalledWith(+existingId, updateCategoryMock);
            expect(resMock.json).toHaveBeenCalledWith(CategoryResponseMock);
        });
        it('should throw BadRequestException if id is not a number', async () => {
            reqMock.params.id = 'ahdjahjhjahf';
            await controller.updateCategory(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(badRequestError));
        });
        it('should throw NotFoundException if id does not exist', async () => {
            reqMock.params.id = nonExistingId;
            reqMock.body = updateCategoryMock;
            CategoryServiceMock.update = jest.fn(() => {
                return Promise.reject(new NotFoundException('Category not found'));
            });
            await controller.updateCategory(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
    })

    describe('delete', () => {
        it('should return status 204 when Category is deleted', async () => {
            reqMock.params.id = existingId;
            CategoryServiceMock.delete.mockResolvedValue(CategoryResponseMock);
            await controller.deleteCategory(reqMock, resMock, nextMock);
            expect(CategoryServiceMock.delete).toHaveBeenCalledWith(+existingId);
            expect(resMock.status).toHaveBeenCalledWith(204);
        });
        it('should throw BadRequestException if id is not a number', async () => {
            reqMock.params.id = 'ahdjahjhjahf';
            await controller.deleteCategory(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(badRequestError));
        });
        it('should throw NotFoundException if id does not exist', async () => {
            reqMock.params.id = nonExistingId;
            CategoryServiceMock.delete = jest.fn(() => {
                return Promise.reject(new NotFoundException('Category not found'));
            });
            await controller.deleteCategory(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
    })

})