import { Decimal } from "@prisma/client/runtime/library";

export class OrderMinResponseDto {
    id: number;
    amount: Decimal;
    moment: Date;
    user: {
        id: number;
        fullName: string;
        email: string;
    }
    constructor(id: number, amount: Decimal, moment: Date, user: { id: number; fullName: string; email: string; }) {
        this.id = id;
        this.amount = amount;
        this.moment = moment;
        this.user = user;
    }
}