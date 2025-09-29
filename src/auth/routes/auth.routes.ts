import { Router } from "express";
import { containerInjector } from "../../common/config/container-injector.config";
import { AuthController } from "../controllers/auth.controller";
import { validateRequest } from "../../common/middlewares/validate-request.middleware";
import { RegisterRequestDto } from "../dto/auth/register-request.dto";
import { LoginRequestDto } from "../dto/auth/login-request.dto";
import { AuthMiddleware } from "../../common/middlewares/auth.middleware";

const authController = containerInjector.resolve(AuthController);
const authMiddleware = containerInjector.resolve(AuthMiddleware);
const authRouter = Router();

authRouter
    .post("/register", validateRequest(RegisterRequestDto, 'body'), authController.register)
    .post("/login", validateRequest(LoginRequestDto, 'body'), authController.login)
    .post("/refresh-token", authMiddleware.execute, authController.refreshToken)
    .post("/logout", authMiddleware.execute, authController.logout);

export default authRouter;