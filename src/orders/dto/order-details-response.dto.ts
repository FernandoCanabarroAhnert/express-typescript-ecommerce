import { Decimal } from "@prisma/client/runtime/library";
import { UserResponseDto } from "../../auth/dto/user/user-response.dto";
import { OrderItemResponseDto } from "./order-item-response.dto";

export class OrderDetailsResponseDto {
    id: number;
    amount: Decimal;
    moment: Date;
    user: UserResponseDto;
    items: OrderItemResponseDto[];
    constructor(id: number, amount: Decimal, moment: Date, user: UserResponseDto, items: OrderItemResponseDto[]) {
        this.id = id;
        this.amount = amount;
        this.moment = moment;
        this.user = user;
        this.items = items;
    }
}