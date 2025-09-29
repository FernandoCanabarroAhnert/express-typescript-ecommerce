import { Decimal } from "@prisma/client/runtime/binary";
import { ProductMapper } from "../../src/common/mappers/product.mapper";
import { CreateProductDto } from "../../src/products/dto/product/create-product.dto";
import { ProductType } from "../../src/products/types/product.type";

export const PRODUCT_REQUEST_MOCK: CreateProductDto = {
    name: 'Product 1',
    description: 'Description 1',
    price: 100,
    brandId: 1,
    categoriesIds: [1]
}

export const PRODUCT_MOCK: ProductType = {
    id: 1,
    name: 'Product 1',
    description: 'Description 1',
    price: new Decimal(100),
    createdAt: new Date(),
    updatedAt: new Date(),
    brandId: 1,
    brand: { id: 1, name: 'Brand 1', description: 'Brand Description 1', createdAt: new Date(), updatedAt: new Date() },
    categories: [{ category: { id: 1, name: 'Category 1', description: 'Category Description 1', createdAt: new Date(), updatedAt: new Date() } }]
}

export const PRODUCT_RESPONSE_MOCK = ProductMapper.mapProductResponse(PRODUCT_MOCK);