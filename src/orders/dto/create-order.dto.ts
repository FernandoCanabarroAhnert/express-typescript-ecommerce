import { ArrayMinSize, IsArray, Validate, ValidateNested } from "class-validator";
import { OrderItemRequestDto } from "./order-item-request.dto";

export class CreateOrderDto {
    @IsArray()
    @ArrayMinSize(1, { message: "Order must contain at least one item" })
    @ValidateNested({ each: true })
    items: OrderItemRequestDto[];
    constructor(items: OrderItemRequestDto[]) {
        this.items = items;
    }
}