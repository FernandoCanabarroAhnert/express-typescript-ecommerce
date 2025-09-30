import { Decimal } from "@prisma/client/runtime/library";
import { ProductType } from "../../products/types/product.type";

export type OrderItemType = {
    quantity: number;
    price: Decimal;
    productId: number;
    orderId: number;
    product: ProductType;
}