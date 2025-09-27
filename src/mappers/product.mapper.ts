import { Request } from "express";
import { ProductResponseDto } from "../dto/product/product-response.dto";
import { UpdateProductDto } from "../dto/product/update-product.dto";
import { CategoryResponseDto } from "../dto/category/category-response.dto";
import { CreateProductDto } from "../dto/product/create-product.dto";
import { ProductType } from "../types/product.type";

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
        return new ProductResponseDto({
            ...product,
            categories: this.mapCategories(product.categories)
        });
    }

    private static mapCategories = (categories: ProductType["categories"]): CategoryResponseDto[] => {
        return categories.map(cat => cat.category);
    }

}