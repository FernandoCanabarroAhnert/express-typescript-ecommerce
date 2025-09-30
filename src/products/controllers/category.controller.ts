import { NextFunction, Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { catchAsync } from "../../common/utils/catch-async";
import { CreateCategoryDto } from "../dto/category/create-category.dto";
import { UpdateCategoryDto } from "../dto/category/update-category.dto";
import { inject, injectable } from "tsyringe";
import { CATEGORY_SERVICE } from "../../common/constants/services.constants";

@injectable()
export class CategoryController {

    constructor(
        @inject(CATEGORY_SERVICE)
        private readonly categoryService: CategoryService
    ) {}

    findAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const categories = await this.categoryService.findAll();
        res.json(categories);
    });

    findById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const category = await this.categoryService.findById(+id);
        return res.json(category);
    });

    createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { name, description } = req.body;
        const dto = new CreateCategoryDto({ name, description });
        const newCategory = await this.categoryService.create(dto);
        return res.status(201).json(newCategory);
    });

    updateCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const { name, description } = req.body;
        const dto = new UpdateCategoryDto({ name, description });
        const updatedCategory = await this.categoryService.update(+id, dto);
        return res.json(updatedCategory);
    });

    deleteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        await this.categoryService.delete(+id);
        return res.status(204).send();
    });

}