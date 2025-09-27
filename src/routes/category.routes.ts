import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { CreateCategoryDto } from "../dto/category/create-category.dto";
import { UpdateCategoryDto } from "../dto/category/update-category.dto";
import { containerInjector } from "../config/container-injector.config";
import { validateRequest } from "../middlewares/validate-request.middleware";

const categoryController = containerInjector.resolve(CategoryController);
const categoryRoutes = Router();

categoryRoutes
    .get("/", categoryController.findAll)
    .get("/:id", categoryController.findById)
    .post("/", validateRequest(CreateCategoryDto, 'body'), categoryController.createCategory)
    .patch("/:id", validateRequest(UpdateCategoryDto, 'body'), categoryController.updateCategory)
    .delete("/:id", categoryController.deleteCategory);

export default categoryRoutes;