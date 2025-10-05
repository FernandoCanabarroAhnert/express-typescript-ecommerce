import "reflect-metadata";

import express from 'express';
import productRoutes from './products/routes/product.routes';
import { handleError } from './common/filters/global-exception.filter';
import brandsRoutes from './products/routes/brands.routes';
import categoryRoutes from './products/routes/category.routes';
import authRouter from "./auth/routes/auth.routes";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { TooManyRequestsException } from "./common/exceptions/too-many-requests.exception";
import orderRouter from "./orders/routes/order.routes";
import { env } from "./common/config/env.config";
import { logger } from "./common/config/winston.config";
import { loggerMiddleware } from "./common/middlewares/logger.middleware";
import swagger from 'swagger-ui-express';
import swaggerFile from './common/docs/swagger-output.json';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors());

app.use(loggerMiddleware);

if (env.NODE_ENV !== 'test') {
    const loginLimiter = rateLimit({
        max: 5,
        windowMs: 15 * 60 * 1000,
        message: new TooManyRequestsException("Too many login attempts from this IP, please try again after 15 minutes.")
    });
    app.use('/auth/login', loginLimiter);

    const limiter = rateLimit({
        max: 60,
        windowMs: 60 * 60 * 1000,
        skip: (req) => req.path.startsWith('/auth/login'),
        message: new TooManyRequestsException("Too many requests from this IP, please try again after an hour.")
    });
    app.use(limiter);
}

app.use('/products', productRoutes);
app.use('/brands', brandsRoutes);
app.use('/categories', categoryRoutes);
app.use('/auth', authRouter);
app.use('/orders', orderRouter);

app.use('/docs', swagger.serve, swagger.setup(swaggerFile));

app.use(handleError);

app.listen(env.PORT, () => {
    logger.info(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
});

export default app;