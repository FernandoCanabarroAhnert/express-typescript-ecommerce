import { Decimal } from "@prisma/client/runtime/library";
import { ProductResponseDto } from "../../products/dto/product/product-response.dto";

export class OrderItemResponseDto {
    productId: number;
    orderId: number;
    quantity: number;
    price: Decimal;
    product: ProductResponseDto;
    constructor(productId: number, orderId: number, quantity: number, price: Decimal, product: ProductResponseDto) {
        this.productId = productId;
        this.orderId = orderId;
        this.quantity = quantity;
        this.price = price;
        this.product = product;
    }
}