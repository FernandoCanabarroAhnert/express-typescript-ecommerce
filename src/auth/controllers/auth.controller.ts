import { inject, injectable } from "tsyringe";
import { AUTH_SERVICE } from "../../common/constants/services.constants";
import { AuthService } from "../services/auth.service";
import { catchAsync } from "../../common/utils/catch-async";
import { NextFunction, Request, Response } from "express";
import { AuthMapper } from "../../common/mappers/auth.mapper";

@injectable()
export class AuthController {

    constructor(
        @inject(AUTH_SERVICE)
        private readonly authService: AuthService,
    ) {}

    register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const registerRequestDto = AuthMapper.mapRegisterRequest(req);
        const user = await this.authService.register(registerRequestDto);
        return res.status(201).json(user);
    });

    login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;
        const accessToken = await this.authService.login({ email, password }, res);
        return res.json({ accessToken });
    });

    refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const accessToken = await this.authService.refreshToken(req);
        return res.json({ accessToken });
    });

    logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await this.authService.logout(req, res);
        return res.status(204).send();
    });
    
} 