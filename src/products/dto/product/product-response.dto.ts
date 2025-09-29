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
    constructor(id: number, name: string, price: Decimal, description: string, brand: BrandResponseDto, categories: CategoryResponseDto[]) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
        this.brand = brand;
        this.categories = categories;
    }
}