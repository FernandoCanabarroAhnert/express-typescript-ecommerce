import { Request } from "express";
import { ProductResponseDto } from "../../products/dto/product/product-response.dto";
import { UpdateProductDto } from "../../products/dto/product/update-product.dto";
import { CategoryResponseDto } from "../../products/dto/category/category-response.dto";
import { CreateProductDto } from "../../products/dto/product/create-product.dto";
import { ProductType } from "../../products/types/product.type";
import { CategoryMapper } from "./category.mapper";
import { BrandMapper } from "./brand.mapper";

export class ProductMapper {

    static mapCreateProduct = (req: Request): CreateProductDto => {
        const { name, price, description, brandId, categoriesIds } = req.body;
        return new CreateProductDto({ name, price, description, brandId, categoriesIds });
    }

    static mapUpdateProduct = (req: Request): UpdateProductDto => {
        const { name, price, description, brandId, categoriesIds } = req.body;
        return new UpdateProductDto({ name, price, description, brandId, categoriesIds });
    }

    static mapProductResponse = (product: ProductType): ProductResponseDto => {
        return new ProductResponseDto(
            product.id,
            product.name, 
            product.price,
            product.description,
            BrandMapper.mapBrandResponse(product.brand),
            this.mapCategories(product.categories)
        );
    }

    private static mapCategories = (categories: ProductType["categories"]): CategoryResponseDto[] => {
        return categories.map(cat => CategoryMapper.mapCategoryResponse(cat.category));
    }

}