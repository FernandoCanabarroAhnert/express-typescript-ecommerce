import 'reflect-metadata';

import { BrandService } from '../../src/products/services/brand.service';
import { container } from 'tsyringe';
import { PRISMA_SERVICE } from '../../src/common/constants/services.constants';
import { BrandType } from '../../src/products/types/brand.type';
import { BrandResponseDto } from '../../src/products/dto/brand/brand-response.dto';
import { BRAND_MOCK, BRAND_REQUEST_MOCK, BRAND_RESPONSE_MOCK } from '../mocks/brands.mocks';
import { CreateBrandDto } from '../../src/products/dto/brand/create-brand.dto';
import { UpdateBrandDto } from '../../src/products/dto/brand/update-brand.dto';
import { NotFoundException } from '../../src/common/exceptions/not-found.exception';

describe('BrandService', () => {
    let service: BrandService;
    const prismaMock = {
        brand: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
    }

    const existingId = 1;
    const nonExistingId = 999;
    let brandMock: BrandType;
    let createBrandDto: CreateBrandDto;
    let updateBrandDto: UpdateBrandDto;
    let brandResponseMock: BrandResponseDto;

    beforeAll(() => {
        container.registerInstance(PRISMA_SERVICE, prismaMock);

        service = container.resolve(BrandService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        brandMock = BRAND_MOCK;
        createBrandDto = BRAND_REQUEST_MOCK;
        updateBrandDto = BRAND_REQUEST_MOCK as UpdateBrandDto;
        brandResponseMock = BRAND_RESPONSE_MOCK;
    });

    describe('findAll', () => {
        it('should return an array of brands', async () => {
            prismaMock.brand.findMany.mockResolvedValue([brandMock]);
            const result = await service.findAll();
            expect(result).toEqual([brandResponseMock]);
        });
    });

    describe('findById', () => {
        it('should return a brand by id', async () => {
            prismaMock.brand.findUnique.mockResolvedValue(brandMock);
            const result = await service.findById(existingId);
            expect(result).toEqual(brandResponseMock);
        });
        it('should throw NotFoundException if brand not found', async () => {
            prismaMock.brand.findUnique.mockResolvedValue(null);
            await expect(service.findById(nonExistingId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create a new brand', async () => {
            prismaMock.brand.create.mockResolvedValue(brandMock);
            const result = await service.create(createBrandDto);
            expect(result).toEqual(brandResponseMock);
            expect(prismaMock.brand.create).toHaveBeenCalledWith({ data: { ...createBrandDto } });
        });
    });

    describe('update', () => {
        it('should update a brand by id', async () => {
            prismaMock.brand.findUnique.mockResolvedValue(brandMock);
            prismaMock.brand.update.mockResolvedValue(brandMock);
            const result = await service.update(existingId, updateBrandDto);
            expect(result).toEqual(brandResponseMock);
            expect(prismaMock.brand.update).toHaveBeenCalledWith({ 
                where: { id: existingId },
                data: {
                    ...updateBrandDto
                } 
            });
        });
        it('should throw NotFoundException if brand to update not found', async () => {
            prismaMock.brand.findUnique.mockResolvedValue(null);
            await expect(service.update(nonExistingId, updateBrandDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete a brand by id', async () => {
            prismaMock.brand.findUnique.mockResolvedValue(brandMock);
            prismaMock.brand.delete.mockResolvedValue(brandMock);
            await service.delete(existingId);
            expect(prismaMock.brand.delete).toHaveBeenCalledWith({ where: { id: existingId } });
        });
        it('should throw NotFoundException if brand to delete not found', async () => {
            prismaMock.brand.findUnique.mockResolvedValue(null);
            await expect(service.delete(nonExistingId)).rejects.toThrow(NotFoundException);
        });
    });

})