import { BrandType } from "../../src/products/types/brand.type";
import { BrandResponseDto } from "../../src/products/dto/brand/brand-response.dto";
import { CreateBrandDto } from "../../src/products/dto/brand/create-brand.dto";
import { BrandMapper } from "../../src/common/mappers/brand.mapper"; 

export const BRAND_MOCK: BrandType = {
    id: 1,
    name: 'Brand 1',
    description: 'Brand Description 1',
    createdAt: new Date(),
    updatedAt: new Date()
};

export const BRAND_REQUEST_MOCK: CreateBrandDto = {
    name: 'Brand 1',
    description: 'Brand Description 1',
}

export const BRAND_RESPONSE_MOCK: BrandResponseDto = BrandMapper.mapBrandResponse(BRAND_MOCK);