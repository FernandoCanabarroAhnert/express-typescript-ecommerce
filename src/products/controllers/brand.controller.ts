import { NextFunction, Request, Response } from "express";
import { BrandService } from "../services/brand.service";
import { catchAsync } from "../../common/utils/catch-async";
import { CreateBrandDto } from "../dto/brand/create-brand.dto";
import { UpdateBrandDto } from "../dto/brand/update-brand.dto";
import { inject, injectable } from "tsyringe";
import { BRAND_SERVICE } from "../../common/constants/services.constants";

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
        return res.json(brand);
    });

    createBrand = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { name, description } = req.body;
        const dto = new CreateBrandDto({ name, description });
        const brand = await this.brandService.create(dto);
        return res.status(201).json(brand);
    });

    updateBrand = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const { name, description } = req.body;
        const dto = new UpdateBrandDto({ name, description });
        const updatedBrand = await this.brandService.update(+id, dto);
        return res.json(updatedBrand);
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        await this.brandService.delete(+id);
        return res.status(204).send();
    });

}