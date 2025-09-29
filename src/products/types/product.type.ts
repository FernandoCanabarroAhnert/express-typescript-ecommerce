import { Decimal } from "@prisma/client/runtime/library";
import { CategoryType } from "./category.type";
import { BrandType } from "./brand.type";

export type ProductType = {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    price: Decimal;
    brandId: number;
    brand: BrandType;
    categories: {
        category: CategoryType
    }[]
}