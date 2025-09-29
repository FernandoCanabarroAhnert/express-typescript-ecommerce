import { NextFunction, Request, Response } from "express";
import { BrandService } from "../services/brand.service";
import { catchAsync } from "../../common/utils/catch-async";
import { CreateBrandDto } from "../dto/brand/create-brand.dto";
import { UpdateBrandDto } from "../dto/brand/create-brand.dto copy";
import { inject, injectable } from "tsyringe";
import { BRAND_SERVICE } from "../../common/constants/services.constants";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { BrandMapper } from "../../common/mappers/brand.mapper";

@injectable()
export class BrandController {

    constructor(
        @inject(BRAND_SERVICE)
        private readonly brandService: BrandService
    ) {}

    findAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const brands = (await this.brandService.findAll()).map(BrandMapper.mapBrandResponse);
        return res.json(brands);
    });

    findById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const brand = await this.brandService.findById(+id);
        if (!brand) {
            throw new NotFoundException(`Brand with id ${id} not found`)
        }
        return res.json(BrandMapper.mapBrandResponse(brand));
    });

    createBrand = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { name, description } = req.body;
        const dto = new CreateBrandDto({ name, description });
        const newBrand = await this.brandService.create(dto);
        return res.status(201).json(BrandMapper.mapBrandResponse(newBrand));
    });

    updateBrand = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const brandExists = await this.brandService.findById(+id);
        if (!brandExists) {
            throw new NotFoundException(`Brand with id ${id} not found`)
        }
        const { name, description } = req.body;
        const dto = new UpdateBrandDto({ name, description });
        const updatedBrand = await this.brandService.update(+id, dto);
        return res.json(BrandMapper.mapBrandResponse(updatedBrand));
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        const brandExists = await this.brandService.findById(+id);
        if (!brandExists) {
            throw new NotFoundException(`Brand with id ${id} not found`)
        }
        await this.brandService.delete(+id);
        return res.status(204).send();
    });

}