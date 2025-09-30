import { CategoryType } from "../../src/products/types/category.type";
import { CategoryResponseDto } from "../../src/products/dto/category/category-response.dto";
import { CategoryMapper } from "../../src/common/mappers/category.mapper"; 
import { CreateCategoryDto } from "../../src/products/dto/category/create-category.dto";

export const CATEGORY_MOCK: CategoryType = {
    id: 1,
    name: 'Category 1',
    description: 'Category Description 1',
    createdAt: new Date(),
    updatedAt: new Date()
};

export const CATEGORY_REQUEST_MOCK: CreateCategoryDto = {
    name: 'Category 1',
    description: 'Category Description 1'
}

export const CATEGORY_RESPONSE_MOCK: CategoryResponseDto = CategoryMapper.mapCategoryResponse(CATEGORY_MOCK);