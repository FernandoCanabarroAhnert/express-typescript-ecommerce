import { inject, injectable } from "tsyringe";
import { ORDER_SERVICE } from "../../common/constants/services.constants";
import { OrderService } from "../services/order.service";
import { catchAsync } from "../../common/utils/catch-async";
import { NextFunction, Request, Response } from "express";
import { OrderMapper } from "../../common/mappers/order.mapper";
import { obtainPaginationParams } from "../../common/utils/pagination.utils";
import { obtainAndValidateId } from "../../common/utils/id.utils";

@injectable()
export class OrderController {

    constructor(
        @inject(ORDER_SERVICE)
        private readonly orderService: OrderService
    ) {}

    findAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { page, size, sort, order } = obtainPaginationParams(req);
        const pageResponse = await this.orderService.findAll(page, size, sort, order);
        return res.json(pageResponse);
    });

    findById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = obtainAndValidateId(req);
        const user = req.user!;
        const order = await this.orderService.findById(id, user);
        return res.json(order);
    });

    createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const createOrderDto = OrderMapper.mapCreateOrder(req);
        const user = req.user!;
        const order = await this.orderService.create(createOrderDto, user);
        return res.status(201).json(order);
    });

}