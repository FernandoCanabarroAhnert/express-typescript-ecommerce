import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { CreateProductDto } from "../dto/product/create-product.dto";
import { UpdateProductDto } from "../dto/product/update-product.dto";
import { PaginationParamsDto } from "../dto/page/pagination-params.dto";
import { containerInjector } from "../config/container-injector.config";
import { validateRequest } from "../middlewares/validate-request.middleware";

const productController = containerInjector.resolve(ProductController);
const productRoutes = Router();

productRoutes
    .get("/", validateRequest(PaginationParamsDto, 'query'), productController.findAllProducts)
    .get('/:id', productController.findById)
    .post("/", validateRequest(CreateProductDto, 'body'), productController.createProduct)
    .patch('/:id', validateRequest(UpdateProductDto, 'body'), productController.updateProduct)
    .delete('/:id', productController.deleteProduct);

export default productRoutes;