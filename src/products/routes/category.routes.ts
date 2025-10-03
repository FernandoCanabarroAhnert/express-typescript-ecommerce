import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { CreateCategoryDto } from "../dto/category/create-category.dto";
import { UpdateCategoryDto } from "../dto/category/update-category.dto";
import { containerInjector } from "../../common/config/container-injector.config";
import { validateRequest } from "../../common/middlewares/validate-request.middleware";
import { PaginationParamsDto } from "../../common/dto/page/pagination-params.dto";
import { RolesEnum } from "../../common/enums/roles.enum";
import { AuthMiddleware } from "../../common/middlewares/auth.middleware";
import { PreAuthorizeMiddleware } from "../../common/middlewares/pre-authorize.middleware";

const categoryController = containerInjector.resolve(CategoryController);
const authMiddleware = containerInjector.resolve(AuthMiddleware);
const preAuthorizeMiddleware = containerInjector.resolve(PreAuthorizeMiddleware);
const categoryRoutes = Router();

categoryRoutes
    .get("/", validateRequest(PaginationParamsDto, 'query'), categoryController.findAll)
    .get("/:id", categoryController.findById)
    .post("/", authMiddleware.execute, preAuthorizeMiddleware.execute(RolesEnum.ADMIN), validateRequest(CreateCategoryDto, 'body'), categoryController.createCategory)
    .patch("/:id", authMiddleware.execute, preAuthorizeMiddleware.execute(RolesEnum.ADMIN), validateRequest(UpdateCategoryDto, 'body'), categoryController.updateCategory)
    .delete("/:id", authMiddleware.execute, preAuthorizeMiddleware.execute(RolesEnum.ADMIN), categoryController.deleteCategory);

export default categoryRoutes;