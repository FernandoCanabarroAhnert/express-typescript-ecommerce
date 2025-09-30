import { IsArray, Validate, ValidateNested } from "class-validator";
import { OrderItemRequestDto } from "./order-item-request.dto";

export class CreateOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Validate((order: CreateOrderDto) => order.items.length > 0, {
        message: "Order must contain at least one item",
    })
    items: OrderItemRequestDto[];
    constructor(items: OrderItemRequestDto[]) {
        this.items = items;
    }
}