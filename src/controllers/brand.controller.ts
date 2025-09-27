import { NextFunction, Request, Response } from "express";
import { BrandService } from "../services/brand.service";
import { catchAsync } from "../utils/catch-async";
import { ErrorResponseDto } from "../exceptions/error-response.dto";
import { CreateBrandDto } from "../dto/brand/create-brand.dto";
import { UpdateBrandDto } from "../dto/brand/create-brand.dto copy";
import { inject, injectable } from "tsyringe";
import { BRAND_SERVICE } from "../constants/services.constants";

@injectable()
export class BrandController {

    constructor(
        @inject(BRAND_SERVICE)
        private readonly brandService: BrandService
    ) {}

    findAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const brands = await this.brandService.findAll();
        return res.json(brands);
    });

    findById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const brand = await this.brandService.findById(+id);
        if (!brand) {
            return next(new ErrorResponseDto(404, 'Not Found', `Brand with id ${id} not found`));
        }
        return res.json(brand);
    });

    createBrand = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { name, description } = req.body;
        const dto = new CreateBrandDto({ name, description });
        const newBrand = await this.brandService.create(dto);
        return res.status(201).json(newBrand);
    });

    updateBrand = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const brandExists = await this.brandService.findById(+id);
        if (!brandExists) {
            return next(new ErrorResponseDto(404, 'Not Found', `Brand with id ${id} not found`));
        }
        const { name, description } = req.body;
        const dto = new UpdateBrandDto({ name, description });
        const updatedBrand = await this.brandService.update(+id, dto);
        return res.json(updatedBrand);
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const brandExists = await this.brandService.findById(+id);
        if (!brandExists) {
            return next(new ErrorResponseDto(404, 'Not Found', `Brand with id ${id} not found`));
        }
        await this.brandService.delete(+id);
        return res.status(204).send();
    });

}