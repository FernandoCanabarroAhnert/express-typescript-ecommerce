import { Request } from "express";
import { CreateOrderDto } from "../../orders/dto/create-order.dto";
import { OrderDetailsType } from "../../orders/types/order-details.type";
import { OrderDetailsResponseDto } from "../../orders/dto/order-details-response.dto";
import { UserMapper } from "./user.mapper";
import { OrderItemType } from "../../orders/types/order-item.type";
import { OrderItemResponseDto } from "../../orders/dto/order-item-response.dto";
import { ProductMapper } from "./product.mapper";
import { OrderMinType } from "../../orders/types/order-min.type";
import { OrderMinResponseDto } from "../../orders/dto/order-min-response.dto";

export class OrderMapper {

    static mapCreateOrder(req: Request): CreateOrderDto {
        const { items } = req.body;
        return new CreateOrderDto(items);
    }

    static mapOrderItemResponse(item: OrderItemType): OrderItemResponseDto {
        return new OrderItemResponseDto(
            item.productId,
            item.orderId,
            item.quantity,
            item.price,
            ProductMapper.mapProductResponse(item.product)
        )
    }

    static mapOrderDetailsResponse(order: OrderDetailsType): OrderDetailsResponseDto {
        return new OrderDetailsResponseDto(
            order.id,
            order.amount,
            order.moment,
            UserMapper.mapUserResponse(order.user),
            order.items.map(item => this.mapOrderItemResponse(item))
        )
    }

    static mapOrderMinResponse(order: OrderMinType): OrderMinResponseDto {
        return new OrderMinResponseDto(
            order.id,
            order.amount,
            order.moment,
            {
                id: order.user.id,
                fullName: order.user.fullName,
                email: order.user.email
            }
        );
    }

}