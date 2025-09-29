import { inject, injectable } from "tsyringe";
import { AUTH_SERVICE, BLACKLIST_TOKEN_SERVICE, JWT_SERVICE, PASSWORD_SERVICE, REFRESH_TOKEN_SERVICE, USER_SERVICE } from "../../common/constants/services.constants";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";
import { PasswordService } from "../services/password.service";
import { catchAsync } from "../../common/utils/catch-async";
import { NextFunction, Request, Response } from "express";
import { AuthMapper } from "../../common/mappers/auth.mapper";
import { UserMapper } from "../../common/mappers/user.mapper";
import { JwtService } from "../services/jwt.service";
import { RefreshTokenService } from "../services/refresh-token.service";
import { BlacklistTokenService } from "../services/blacklist-token.service";
import jwt from "jsonwebtoken";
import { ConflictException } from "../../common/exceptions/confilct.exception";
import { UnauthorizedException } from "../../common/exceptions/unauthorized.exception";

@injectable()
export class AuthController {

    constructor(
        @inject(USER_SERVICE)
        private readonly userService: UserService,
        @inject(AUTH_SERVICE)
        private readonly authService: AuthService,
        @inject(PASSWORD_SERVICE)
        private readonly passwordService: PasswordService,
        @inject(JWT_SERVICE)
        private readonly jwtService: JwtService,
        @inject(REFRESH_TOKEN_SERVICE)
        private readonly refreshTokenService: RefreshTokenService,
        @inject(BLACKLIST_TOKEN_SERVICE)
        private readonly blacklistTokenService: BlacklistTokenService
    ) {}

    register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const registerRequestDto = AuthMapper.mapRegisterRequest(req);
        const emailAlreadyExists = await this.userService.findByEmail(registerRequestDto.email);
        if (emailAlreadyExists) {
            throw new ConflictException("Email already in use");
        }
        const hashedPassword = await this.passwordService.encodePassword(registerRequestDto.password);
        const user = await this.authService.register({
            ...registerRequestDto,
            password: hashedPassword
        });
        const response = UserMapper.mapUserResponse(user);
        return res.status(201).json(response);
    });

    login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException("Invalid email or password");
        }
        const passwordMatches = await this.passwordService.passwordMatches(password, user.password);
        if (!passwordMatches) {
            throw new UnauthorizedException("Invalid email or password");
        }
        const jwtPayload = { email, authorities: user.roles.map(role => role.role.authority) };
        const accessToken = this.jwtService.encodeAccessToken(jwtPayload);
        const refreshToken = this.jwtService.encodeRefreshToken(email);
        await this.refreshTokenService.saveRefreshToken(this.jwtService.decodeToken(refreshToken), refreshToken);
        this.setRefreshTokenCookie(res, refreshToken);
        return res.json({ accessToken });
    });

    refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = await this.obtainAndValidateRefreshToken(req, next) as jwt.JwtPayload;
        const email = refreshToken.subject!;
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException("User not found");
        }
        const jwtPayload = { email, authorities: user.roles.map(role => role.role.authority) };
        const accessToken = this.jwtService.encodeAccessToken(jwtPayload);
        return res.json({ accessToken });
    });

    logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = await this.obtainAndValidateRefreshToken(req, next) as jwt.JwtPayload;
        await this.refreshTokenService.deleteRefreshToken(refreshToken.jti!);
        this.setRefreshTokenCookie(res, "");
        const bearerTokenValue = req.headers.authorization?.split(' ')[1]!;
        const decodedBearerToken = this.jwtService.decodeToken(bearerTokenValue);
        await this.blacklistTokenService.addToBlacklist(decodedBearerToken, bearerTokenValue);
        return res.status(204).send();
    });

    private setRefreshTokenCookie(res: Response, refreshToken: string) {
        res.cookie("refresh_token", refreshToken, {
            expires: new Date(Date.now() + 86400 * 30 * 1000),
            httpOnly: true,
            secure: true
        });
    }

    private async obtainAndValidateRefreshToken(req: Request, next: NextFunction): Promise<jwt.JwtPayload | void> {
        const refreshToken = req.cookies["refresh_token"];
        if (!refreshToken || refreshToken.trim() === "") {
            throw new UnauthorizedException("Refresh token is required");
        }
        const isTokenValid = this.jwtService.isTokenValid(refreshToken);
        if (!isTokenValid) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        const decodedRefreshToken = this.jwtService.decodeToken(refreshToken);
        const refreshTokenExists = await this.refreshTokenService.refreshTokenExists(decodedRefreshToken.jti!);
        if (!refreshTokenExists) {
            throw new UnauthorizedException("Refresh token does not exist");
        }
        return decodedRefreshToken;
    }
    
} 