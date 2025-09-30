import { Router } from "express";
import { containerInjector } from "../../common/config/container-injector.config";
import { OrderController } from "../controllers/order.controller";
import { AuthMiddleware } from "../../common/middlewares/auth.middleware";
import { validateRequest } from "../../common/middlewares/validate-request.middleware";
import { PaginationParamsDto } from "../../common/dto/page/pagination-params.dto";
import { PreAuthorizeMiddleware } from "../../common/middlewares/pre-authorize.middleware";
import { RolesEnum } from "../../common/enums/roles.enum";

const orderController = containerInjector.resolve(OrderController);
const authMiddleware = containerInjector.resolve(AuthMiddleware);
const preAuthorizeMiddleware = containerInjector.resolve(PreAuthorizeMiddleware);
const orderRouter = Router();

orderRouter
    .get('/', authMiddleware.execute, preAuthorizeMiddleware.execute(RolesEnum.ADMIN), validateRequest(PaginationParamsDto, 'query'), orderController.findAll)
    .get('/:id', authMiddleware.execute, orderController.findById)
    .post('/', authMiddleware.execute, orderController.createOrder);

export default orderRouter;