import { container } from "tsyringe";
import { PRODUCT_SERVICE, BRAND_SERVICE, CATEGORY_SERVICE, REDIS_SERVICE, PRISMA_SERVICE } from "../constants/services.constants";
import { BrandService } from "../services/brand.service";
import { CategoryService } from "../services/category.service";
import { ProductService } from "../services/product.service";
import { RedisService } from "../services/redis.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

container.registerInstance(PRISMA_SERVICE, prisma);
container.registerSingleton(PRODUCT_SERVICE, ProductService);
container.registerSingleton(BRAND_SERVICE, BrandService);
container.registerSingleton(CATEGORY_SERVICE, CategoryService);
container.registerSingleton(REDIS_SERVICE, RedisService);

export { container as containerInjector };

