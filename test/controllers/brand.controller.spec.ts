import "reflect-metadata";

import { BrandController } from '../../src/products/controllers/brand.controller';
import { container } from 'tsyringe';
import { BRAND_SERVICE } from '../../src/common/constants/services.constants';
import { UpdateBrandDto } from "../../src/products/dto/brand/update-brand.dto";
import { BRAND_REQUEST_MOCK, BRAND_RESPONSE_MOCK } from '../mocks/brands.mocks';
import { PageResponseDto } from "../../src/common/dto/page/page-response.dto";
import { BrandResponseDto } from "../../src/products/dto/brand/brand-response.dto";
import { CreateBrandDto } from "../../src/products/dto/brand/create-brand.dto";
import { NotFoundException } from "../../src/common/exceptions/not-found.exception";

describe('BrandController', () => {
    let controller: BrandController;

    const brandServiceMock = {
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

    let createBrandMock: CreateBrandDto;
    let updateBrandMock: UpdateBrandDto;
    let brandResponseMock: BrandResponseDto;
    let paginatedBrandsMock: PageResponseDto<BrandResponseDto>;

    beforeAll(() => {
        container.registerInstance(BRAND_SERVICE, brandServiceMock);

        controller = container.resolve(BrandController);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        createBrandMock = BRAND_REQUEST_MOCK;
        updateBrandMock = createBrandMock as UpdateBrandDto;
        brandResponseMock = BRAND_RESPONSE_MOCK;
        paginatedBrandsMock = {
            data: [brandResponseMock],
            numberOfItems: 1,
            totalItems: 1,
            currentPage: 1,
            totalPages: 1
        }
    });

    describe('findAll', () => {
        it('should return paginated brands', async () => {
            brandServiceMock.findAll.mockResolvedValue(paginatedBrandsMock);
            await controller.findAll(reqMock, resMock, nextMock);
            expect(resMock.json).toHaveBeenCalledWith(paginatedBrandsMock);
        });
    });

    describe('findById', () => {
        it('should return a brand if id exists', async () => {
            reqMock.params.id = existingId;
            brandServiceMock.findById.mockResolvedValue(brandResponseMock);
            await controller.findById(reqMock, resMock, nextMock);
            expect(resMock.json).toHaveBeenCalledWith(brandResponseMock);
        });
        it('should throw BadRequestException if id is not a number', async () => {
            reqMock.params.id = 'ahdjahjhjahf';
            await controller.findById(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(badRequestError));
        });
        it('should throw NotFoundException if id does not exist', async () => {
            reqMock.params.id = nonExistingId;
            brandServiceMock.findById = jest.fn(() => {
                return Promise.reject(new NotFoundException('Brand not found'));
            });
            await controller.findById(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
    });

    describe('create', () => {
        it('should create and return the new brand', async () => {
            reqMock.body = createBrandMock;
            brandServiceMock.create.mockResolvedValue(brandResponseMock);
            await controller.createBrand(reqMock, resMock, nextMock);
            expect(brandServiceMock.create).toHaveBeenCalledWith(createBrandMock);
            expect(resMock.status).toHaveBeenCalledWith(201);
        });
    });

    describe('update', () => {
        it('should update and return the updated brand if id exists', async () => {
            reqMock.params.id = existingId;
            reqMock.body = updateBrandMock;
            brandServiceMock.update.mockResolvedValue(brandResponseMock);
            await controller.updateBrand(reqMock, resMock, nextMock);
            expect(brandServiceMock.update).toHaveBeenCalledWith(+existingId, updateBrandMock);
            expect(resMock.json).toHaveBeenCalledWith(brandResponseMock);
        });
        it('should throw BadRequestException if id is not a number', async () => {
            reqMock.params.id = 'ahdjahjhjahf';
            await controller.updateBrand(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(badRequestError));
        });
        it('should throw NotFoundException if id does not exist', async () => {
            reqMock.params.id = nonExistingId;
            reqMock.body = updateBrandMock;
            brandServiceMock.update = jest.fn(() => {
                return Promise.reject(new NotFoundException('Brand not found'));
            });
            await controller.updateBrand(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
    })

    describe('delete', () => {
        it('should return status 204 when brand is deleted', async () => {
            reqMock.params.id = existingId;
            brandServiceMock.delete.mockResolvedValue(brandResponseMock);
            await controller.delete(reqMock, resMock, nextMock);
            expect(brandServiceMock.delete).toHaveBeenCalledWith(+existingId);
            expect(resMock.status).toHaveBeenCalledWith(204);
        });
        it('should throw BadRequestException if id is not a number', async () => {
            reqMock.params.id = 'ahdjahjhjahf';
            await controller.delete(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(badRequestError));
        });
        it('should throw NotFoundException if id does not exist', async () => {
            reqMock.params.id = nonExistingId;
            brandServiceMock.delete = jest.fn(() => {
                return Promise.reject(new NotFoundException('Brand not found'));
            });
            await controller.delete(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
    })

})