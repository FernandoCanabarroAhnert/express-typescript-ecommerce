import { CategoryResponseDto } from "../../products/dto/category/category-response.dto";
import { CategoryType } from "../../products/types/category.type";

export class CategoryMapper {
    static mapCategoryResponse(category: CategoryType): CategoryResponseDto {
        return new CategoryResponseDto(
            category.id,
            category.name,
            category.description
        );
    }
}