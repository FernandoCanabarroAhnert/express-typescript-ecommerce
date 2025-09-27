import { Decimal } from "@prisma/client/runtime/library";

export type ProductType = {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    price: Decimal;
    brandId: number;
    brand: {
        id: number;
        name: string;
        description: string;
    };
    categories: {
        category: {
            id: number;
            name: string;
            description: string;
        };
    }[]
}