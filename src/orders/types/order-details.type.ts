import { Decimal } from "@prisma/client/runtime/library";
import { UserType } from "../../auth/types/user.type";
import { ProductType } from "../../products/types/product.type";

export type OrderDetailsType = {
    items: {
        quantity: number;
        price: Decimal;
        productId: number;
        orderId: number;
        product: ProductType
    }[];
    user: UserType;
    amount: Decimal;
    moment: Date;
    id: number;
    userId: number;
}