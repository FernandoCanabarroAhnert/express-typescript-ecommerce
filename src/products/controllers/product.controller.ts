import { NextFunction, Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { catchAsync } from "../../common/utils/catch-async";
import { ProductMapper } from "../../common/mappers/product.mapper";
import { obtainAndValidateId } from "../../common/utils/id.utils";
import { obtainPaginationParams } from "../../common/utils/pagination.utils";
import { inject, injectable } from "tsyringe";
import { PRODUCT_SERVICE } from "../../common/constants/services.constants";

@injectable()
export class ProductController {

    constructor(
        @inject(PRODUCT_SERVICE)
        private readonly productService: ProductService
    ) {}

    findAllProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { page, size, sort, order } = obtainPaginationParams(req);
        const pageResponse = await this.productService.findAll(page, size, sort, order);
        return res.json(pageResponse);
    }); 

    findById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = obtainAndValidateId(req);
        const response = await this.productService.findById(id);
        return res.json(response);
    });

    createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const dto = ProductMapper.mapCreateProduct(req);
        const newProduct = await this.productService.create(dto);
        return res.status(201).json(newProduct);
    });

    updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = obtainAndValidateId(req);
        const dto = ProductMapper.mapUpdateProduct(req);
        const updatedProduct = await this.productService.update(+id, dto);
        return res.json(updatedProduct);
    });

    deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = obtainAndValidateId(req);
        await this.productService.delete(+id);
        return res.status(204).send();
    });

}