import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class OrderItemRequestDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    productId: number;
    @IsPositive()
    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}