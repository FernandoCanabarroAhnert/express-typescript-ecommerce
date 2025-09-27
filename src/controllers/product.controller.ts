import { NextFunction, Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { ErrorResponseDto } from "../exceptions/error-response.dto";
import { catchAsync } from "../utils/catch-async";
import { BrandService } from "../services/brand.service";
import { CategoryService } from "../services/category.service";
import { ProductResponseDto } from "../dto/product/product-response.dto";
import { ProductMapper } from "../mappers/product.mapper";
import { obtainAndValidateId } from "../utils/id.utils";
import { PageResponseDto } from "../dto/page/page-response.dto";
import { obtainPaginationParams } from "../utils/pagination.utils";
import { inject, injectable } from "tsyringe";
import { BRAND_SERVICE, CATEGORY_SERVICE, PRODUCT_SERVICE, REDIS_SERVICE } from "../constants/services.constants";
import { RedisService } from "../services/redis.service";
import { PRODUCTS_CACHE_KEY } from "../constants/cache-keys.constants";

@injectable()
export class ProductController {

    constructor(
        @inject(PRODUCT_SERVICE)
        private readonly productService: ProductService,
        @inject(BRAND_SERVICE)
        private readonly brandService: BrandService,
        @inject(CATEGORY_SERVICE)
        private readonly categoryService: CategoryService,
        @inject(REDIS_SERVICE)
        private readonly redisService: RedisService
    ) {}

    findAllProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { page, size, sort, order } = obtainPaginationParams(req);
        const pageResponse = await this.productService.findAll(page, size, sort, order);
        return res.json(new PageResponseDto<ProductResponseDto>({
            ...pageResponse,
            data: pageResponse.data.map(ProductMapper.mapProductResponse)
        }));
    }); 

    findById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = obtainAndValidateId(req);
        const cachedProduct = await this.redisService.get<ProductResponseDto>(`${PRODUCTS_CACHE_KEY}:${id}`);
        if (cachedProduct) {
            return res.json(cachedProduct);
        }
        const response = ProductMapper.mapProductResponse(await this.findProductById(id));
        await this.redisService.set(`${PRODUCTS_CACHE_KEY}:${id}`, response);
        return res.json(response);
    });

    createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const dto = ProductMapper.mapCreateProduct(req);
        await this.validateBrand(dto.brandId);
        await this.validateCategories(dto.categoriesIds);
        const newProduct = await this.productService.create(dto);
        return res.status(201).json(ProductMapper.mapProductResponse(newProduct));
    });

    updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = obtainAndValidateId(req);
        const dto = ProductMapper.mapUpdateProduct(req);
        await this.validateBrand(dto.brandId);
        await this.validateCategories(dto.categoriesIds);
        await this.findProductById(id);
        const updatedProduct = await this.productService.update(id, dto);
        return res.json(ProductMapper.mapProductResponse(updatedProduct));
    });

    deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = obtainAndValidateId(req);
        await this.findProductById(id);
        await this.productService.delete(id);
        return res.status(204).send();
    });

    private async findProductById(id: number) {
        const product = await this.productService.findById(id);
        if (!product) {
            throw new ErrorResponseDto(404, "Not Found", `Product with id ${id} not found`);
        }
        return product;
    }

    private async validateBrand(brandId: number) {
        const brandExists = await this.brandService.findById(brandId);
        if (!brandExists) {
            throw new ErrorResponseDto(404, "Not Found", `Brand with id ${brandId} not found`);
        }
    }

    private async validateCategories(categoriesIds: number[]) {
        for (const categoryId of categoriesIds) {
            const categoryExists = await this.categoryService.findById(categoryId);
            if (!categoryExists) {
                throw new ErrorResponseDto(404, "Not Found", `Category with id ${categoryId} not found`);
            }
        }
    }

}