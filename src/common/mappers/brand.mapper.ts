import { BrandResponseDto } from "../../products/dto/brand/brand-response.dto";
import { BrandType } from "../../products/types/brand.type";

export class BrandMapper {
    static mapBrandResponse(brand: BrandType): BrandResponseDto {
        return new BrandResponseDto(
            brand.id,
            brand.name,
            brand.description
        );
    }
}