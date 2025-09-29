import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { CreateProductDto } from "../dto/product/create-product.dto";
import { UpdateProductDto } from "../dto/product/update-product.dto";
import { PaginationParamsDto } from "../../common/dto/page/pagination-params.dto";
import { containerInjector } from "../../common/config/container-injector.config";
import { validateRequest } from "../../common/middlewares/validate-request.middleware";
import { AuthMiddleware } from "../../common/middlewares/auth.middleware";
import { PreAuthorizeMiddleware } from "../../common/middlewares/pre-authorize.middleware";
import { RolesEnum } from "../../common/enums/roles.enum";

const productController = containerInjector.resolve(ProductController);
const authMiddleware = containerInjector.resolve(AuthMiddleware);
const preAuthorizeMiddleware = containerInjector.resolve(PreAuthorizeMiddleware);
const productRoutes = Router();

productRoutes
    .get("/", validateRequest(PaginationParamsDto, 'query'), productController.findAllProducts)
    .get('/:id', productController.findById)
    .post("/", authMiddleware.execute, preAuthorizeMiddleware.execute(RolesEnum.ADMIN), validateRequest(CreateProductDto, 'body'), productController.createProduct)
    .patch('/:id', authMiddleware.execute, preAuthorizeMiddleware.execute(RolesEnum.ADMIN), validateRequest(UpdateProductDto, 'body'), productController.updateProduct)
    .delete('/:id', authMiddleware.execute, preAuthorizeMiddleware.execute(RolesEnum.ADMIN), productController.deleteProduct);

export default productRoutes;