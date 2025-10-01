import 'reflect-metadata';

import { CategoryService } from '../../src/products/services/category.service';
import { container } from 'tsyringe';
import { PRISMA_SERVICE } from '../../src/common/constants/services.constants';
import { CategoryType } from '../../src/products/types/category.type';
import { CategoryResponseDto } from '../../src/products/dto/category/category-response.dto';
import { CATEGORY_MOCK, CATEGORY_REQUEST_MOCK, CATEGORY_RESPONSE_MOCK } from '../mocks/categories.mocks';
import { CreateCategoryDto } from '../../src/products/dto/category/create-category.dto';
import { UpdateCategoryDto } from '../../src/products/dto/category/update-category.dto';
import { NotFoundException } from '../../src/common/exceptions/not-found.exception';

describe('categoryService', () => {
    let service: CategoryService;
    const prismaMock = {
        category: {
            count: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
    }

    const existingId = 1;
    const nonExistingId = 999;
    const paginatedResult = {
        currentPage: 1,
        totalPages: 1,
        numberOfItems: 1,
        totalItems: 1,
        data: [CATEGORY_RESPONSE_MOCK],
    }
    let categoryMock: CategoryType;
    let createcategoryDto: CreateCategoryDto;
    let updatecategoryDto: UpdateCategoryDto;
    let categoryResponseMock: CategoryResponseDto;

    beforeAll(() => {
        container.registerInstance(PRISMA_SERVICE, prismaMock);

        service = container.resolve(CategoryService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        categoryMock = CATEGORY_MOCK;
        createcategoryDto = CATEGORY_REQUEST_MOCK;
        updatecategoryDto = CATEGORY_REQUEST_MOCK as UpdateCategoryDto;
        categoryResponseMock = CATEGORY_RESPONSE_MOCK;
    });

    describe('findAll', () => {
        it('should return PageResponseDto of categories', async () => {
            prismaMock.category.count.mockResolvedValue(1);
            prismaMock.category.findMany.mockResolvedValue([categoryMock]);
            const result = await service.findAll();
            expect(result).toEqual(paginatedResult);
        });
    });

    describe('findById', () => {
        it('should return a category by id', async () => {
            prismaMock.category.findUnique.mockResolvedValue(categoryMock);
            const result = await service.findById(existingId);
            expect(result).toEqual(categoryResponseMock);
        });
        it('should throw NotFoundException if category not found', async () => {
            prismaMock.category.findUnique.mockResolvedValue(null);
            await expect(service.findById(nonExistingId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create a new category', async () => {
            prismaMock.category.create.mockResolvedValue(categoryMock);
            const result = await service.create(createcategoryDto);
            expect(result).toEqual(categoryResponseMock);
            expect(prismaMock.category.create).toHaveBeenCalledWith({ data: { ...createcategoryDto } });
        });
    });

    describe('update', () => {
        it('should update a category by id', async () => {
            prismaMock.category.findUnique.mockResolvedValue(categoryMock);
            prismaMock.category.update.mockResolvedValue(categoryMock);
            const result = await service.update(existingId, updatecategoryDto);
            expect(result).toEqual(categoryResponseMock);
            expect(prismaMock.category.update).toHaveBeenCalledWith({ 
                where: { id: existingId },
                data: {
                    ...updatecategoryDto
                } 
            });
        });
        it('should throw NotFoundException if category to update not found', async () => {
            prismaMock.category.findUnique.mockResolvedValue(null);
            await expect(service.update(nonExistingId, updatecategoryDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete a category by id', async () => {
            prismaMock.category.findUnique.mockResolvedValue(categoryMock);
            prismaMock.category.delete.mockResolvedValue(categoryMock);
            await service.delete(existingId);
            expect(prismaMock.category.delete).toHaveBeenCalledWith({ where: { id: existingId } });
        });
        it('should throw NotFoundException if category to delete not found', async () => {
            prismaMock.category.findUnique.mockResolvedValue(null);
            await expect(service.delete(nonExistingId)).rejects.toThrow(NotFoundException);
        });
    });

})