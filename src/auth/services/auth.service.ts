import { PrismaClient } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { BLACKLIST_TOKEN_SERVICE, JWT_SERVICE, PASSWORD_SERVICE, PRISMA_SERVICE, REFRESH_TOKEN_SERVICE, USER_SERVICE } from "../../common/constants/services.constants";
import { RegisterRequestDto } from "../dto/auth/register-request.dto";
import { UserType } from "../types/user.type";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";
import { UserMapper } from "../../common/mappers/user.mapper";
import { UserResponseDto } from "../dto/user/user-response.dto";
import { ConflictException } from "../../common/exceptions/confilct.exception";
import { PasswordService } from "./password.service";
import { LoginRequestDto } from "../dto/auth/login-request.dto";
import { BlacklistTokenService } from "./blacklist-token.service";
import { JwtService } from "./jwt.service";
import { RefreshTokenService } from "./refresh-token.service";
import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../../common/exceptions/unauthorized.exception";
import { UserService } from "./user.service";
import jwt from "jsonwebtoken";
import { RolesEnum } from "../../common/enums/roles.enum";

@injectable()
export class AuthService {

    private readonly includeQuery = {
        roles: {
            select: {
                role: {
                    select: {
                        id: true,
                        authority: true
                    }
                }
            }
        }
    }

    constructor(
        @inject(PRISMA_SERVICE)
        private readonly prisma: PrismaClient,
        @inject(USER_SERVICE)
        private readonly userService: UserService,
        @inject(PASSWORD_SERVICE)
        private readonly passwordService: PasswordService,
        @inject(JWT_SERVICE)
        private readonly jwtService: JwtService,
        @inject(REFRESH_TOKEN_SERVICE)
        private readonly refreshTokenService: RefreshTokenService,
        @inject(BLACKLIST_TOKEN_SERVICE)
        private readonly blacklistTokenService: BlacklistTokenService
    ) {}

    async register(registerRequestDto: RegisterRequestDto): Promise<UserResponseDto> {
        const emailAlreadyExists = await this.userService.findByEmail(registerRequestDto.email);
        if (emailAlreadyExists) {
            throw new ConflictException("Email already in use");
        }
        const cpfAlreadyExists = await this.userService.findByCpf(registerRequestDto.cpf);
        if (cpfAlreadyExists) {
            throw new ConflictException("CPF already in use");
        }
        const hashedPassword = await this.passwordService.encodePassword(registerRequestDto.password);
        const userRole = await this.prisma.role.findFirst({
            where: {
                authority: 'ROLE_USER'
            }
        });
        const user = await this.prisma.user.create({
            data: {
                ...registerRequestDto,
                birthDate: new Date(registerRequestDto.birthDate),
                password: hashedPassword,
                roles: {
                    create: {
                        role: {
                            connect: {
                                id: userRole!.id
                            }
                        }
                    }
                }
            },
            include: this.includeQuery
        });
        return UserMapper.mapUserResponse(user);
    }

    async login(loginRequestDto: LoginRequestDto, res: Response): Promise<string> {
        const user = await this.userService.findByEmail(loginRequestDto.email);
        if (!user) {
            throw new UnauthorizedException("Invalid email or password");
        }
        const passwordMatches = await this.passwordService.passwordMatches(loginRequestDto.password, user.password);
        if (!passwordMatches) {
            throw new UnauthorizedException("Invalid email or password");
        }
        const jwtPayload = { email: loginRequestDto.email, authorities: user.roles.map(role => role.role.authority) };
        const accessToken = this.jwtService.encodeAccessToken(jwtPayload);
        const refreshToken = this.jwtService.encodeRefreshToken(loginRequestDto.email);
        await this.refreshTokenService.saveRefreshToken(this.jwtService.decodeToken(refreshToken), refreshToken);
        this.setRefreshTokenCookie(res, refreshToken);
        return accessToken;
    }

    async refreshToken(req: Request): Promise<string> {
        const refreshToken = await this.obtainAndValidateRefreshToken(req);
        const email = refreshToken.subject;
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException("User not found");
        }
        const jwtPayload = { email, authorities: user.roles.map(role => role.role.authority) };
        const accessToken = this.jwtService.encodeAccessToken(jwtPayload);
        return accessToken;
    }

    async logout(req: Request, res: Response): Promise<void> {
        const refreshToken = await this.obtainAndValidateRefreshToken(req)
        await this.refreshTokenService.deleteRefreshToken(refreshToken.jti!);
        this.setRefreshTokenCookie(res, "");
        const bearerTokenValue = req.headers.authorization!.split(' ')[1]!;
        const decodedBearerToken = this.jwtService.decodeToken(bearerTokenValue);
        await this.blacklistTokenService.addToBlacklist(decodedBearerToken, bearerTokenValue);
    }

    isAdminOrResourceOwner(user: UserType, resourceUserId: number): void {
        if (user.roles.some(r => r.role.authority === RolesEnum.ADMIN)) {
            return;
        }
        if (user.id === resourceUserId) {
            return;
        }
        throw new ForbiddenException('You do not have permission to access this resource');
    }

    private setRefreshTokenCookie(res: Response, refreshToken: string) {
        res.cookie("refresh_token", refreshToken, {
            expires: new Date(Date.now() + 86400 * 30 * 1000),
            httpOnly: true,
            secure: true
        });
    }

    private async obtainAndValidateRefreshToken(req: Request): Promise<jwt.JwtPayload> {
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