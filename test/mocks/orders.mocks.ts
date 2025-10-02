import { Decimal } from "@prisma/client/runtime/binary";
import { OrderDetailsType } from "../../src/orders/types/order-details.type";
import { PRODUCT_MOCK } from "./products.mocks";
import { USER_MOCK } from "./users.mocks";
import { OrderMinType } from "../../src/orders/types/order-min.type";
import { OrderMapper } from "../../src/common/mappers/order.mapper";
import { CreateOrderDto } from "../../src/orders/dto/create-order.dto";

export const ORDER_DETAILS_MOCK: OrderDetailsType = {
    id: 1,
    userId: 1,
    items: [
        {
            quantity: 1,
            price: new Decimal(100),
            productId: 1,
            orderId: 1,
            product: PRODUCT_MOCK
        }
    ],
    user: USER_MOCK,
    amount: new Decimal(100),
    moment: new Date(),
}
export const ORDER_DETAILS_RESPONSE_MOCK = OrderMapper.mapOrderDetailsResponse(ORDER_DETAILS_MOCK);

export const ORDER_MIN_MOCK: OrderMinType = {
    id: 1,
    amount: new Decimal(100),
    moment: new Date(),
    user: {
        id: USER_MOCK.id,
        fullName: USER_MOCK.fullName,
        email: USER_MOCK.email
    }
}
export const ORDER_MIN_RESPONSE_MOCK = OrderMapper.mapOrderMinResponse(ORDER_MIN_MOCK);

export const ORDER_REQUEST_MOCK: CreateOrderDto = {
    items: [
        {
            productId: 1,
            quantity: 1
        }
    ]
}
