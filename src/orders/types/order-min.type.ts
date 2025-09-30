import { Decimal } from "@prisma/client/runtime/library";

export type OrderMinType = {
    id: number;
    amount: Decimal;
    moment: Date;
    user: {
        id: number;
        fullName: string;
        email: string;
    }
}