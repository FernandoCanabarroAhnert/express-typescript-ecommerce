import { Decimal } from "@prisma/client/runtime/library";
import { BrandResponseDto } from "../brand/brand-response.dto";
import { CategoryResponseDto } from "../category/category-response.dto";

export class ProductResponseDto {
    id: number;
    name: string;
    price: Decimal;
    description: string;
    brand: BrandResponseDto;
    categories: CategoryResponseDto[];
    constructor(partial: Partial<ProductResponseDto>) {
        Object.assign(this, partial);
    }
}