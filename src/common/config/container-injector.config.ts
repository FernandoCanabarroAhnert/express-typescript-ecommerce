import { container } from "tsyringe";
import { PRODUCT_SERVICE, BRAND_SERVICE, CATEGORY_SERVICE, REDIS_SERVICE, PRISMA_SERVICE, USER_SERVICE, AUTH_SERVICE, PASSWORD_SERVICE, JWT_SERVICE, REFRESH_TOKEN_SERVICE, BLACKLIST_TOKEN_SERVICE, AUTH_MIDDLEWARE, PRE_AUTHORIZE_MIDDLEWARE, ORDER_SERVICE } from "../constants/services.constants";
import { BrandService } from "../../products/services/brand.service";
import { CategoryService } from "../../products/services/category.service";
import { ProductService } from "../../products/services/product.service";
import { RedisService } from "../services/redis.service";
import { PrismaClient } from "@prisma/client";
import { UserService } from "../../auth/services/user.service";
import { AuthService } from "../../auth/services/auth.service";
import { PasswordService } from "../../auth/services/password.service";
import { JwtService } from "../../auth/services/jwt.service";
import { RefreshTokenService } from "../../auth/services/refresh-token.service";
import { BlacklistTokenService } from "../../auth/services/blacklist-token.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PreAuthorizeMiddleware } from "../middlewares/pre-authorize.middleware";
import { OrderService } from "../../orders/services/order.service";

const prisma = new PrismaClient();

container.registerInstance(PRISMA_SERVICE, prisma);
container.registerSingleton(PRODUCT_SERVICE, ProductService);
container.registerSingleton(BRAND_SERVICE, BrandService);
container.registerSingleton(CATEGORY_SERVICE, CategoryService);
container.registerSingleton(REDIS_SERVICE, RedisService);
container.registerSingleton(USER_SERVICE, UserService);
container.registerSingleton(AUTH_SERVICE, AuthService);
container.registerSingleton(PASSWORD_SERVICE, PasswordService);
container.registerSingleton(JWT_SERVICE, JwtService);
container.registerSingleton(REFRESH_TOKEN_SERVICE, RefreshTokenService);
container.registerSingleton(BLACKLIST_TOKEN_SERVICE, BlacklistTokenService);
container.registerSingleton(AUTH_MIDDLEWARE, AuthMiddleware);
container.registerSingleton(PRE_AUTHORIZE_MIDDLEWARE, PreAuthorizeMiddleware);
container.registerSingleton(ORDER_SERVICE, OrderService);

export { container as containerInjector };

