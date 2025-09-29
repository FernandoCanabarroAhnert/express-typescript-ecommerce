import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { catchAsync } from "../utils/catch-async";
import { JWT_SERVICE, USER_SERVICE } from "../constants/services.constants";
import { UserService } from "../../auth/services/user.service";
import { JwtService } from "../../auth/services/jwt.service";
import { UserType } from "../../auth/types/user.type";
import { UnauthorizedException } from "../exceptions/unauthorized.exception";

declare global {
    namespace Express {
        interface Request {
            user?: UserType;
        }
    }
}

@injectable()
export class AuthMiddleware {

    constructor(
        @inject(USER_SERVICE)
        private readonly userService: UserService,
        @inject(JWT_SERVICE)
        private readonly jwtService: JwtService
    ) {}

    execute = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid Authorization header");
        }
        const jwt = authHeader.split(" ")[1];
        if (!jwt || jwt.trim() === "") {
            throw new UnauthorizedException("Missing or invalid JWT token");
        }
        if (!this.jwtService.isTokenValid(jwt)) {
            throw new UnauthorizedException("Invalid JWT token");
        }
        const decodedToken = this.jwtService.decodeToken(jwt);
        const email = decodedToken.subject;
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException("User not found");
        }
        req.user = user;
        next();
    });

}