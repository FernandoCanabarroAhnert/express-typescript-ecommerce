import "reflect-metadata"

import { AuthService } from '../../src/auth/services/auth.service';
import { container } from 'tsyringe';
import { BLACKLIST_TOKEN_SERVICE, JWT_SERVICE, PASSWORD_SERVICE, PRISMA_SERVICE, REFRESH_TOKEN_SERVICE, USER_SERVICE } from '../../src/common/constants/services.constants';
import { UserType } from '../../src/auth/types/user.type';
import { ROLE_ADMIN_MOCK, ROLE_USER_MOCK } from '../mocks/roles.mocks';
import { USER_MOCK, USER_RESPONSE_MOCK } from '../mocks/users.mocks';
import { LOGIN_REQUEST_MOCK, REGISTER_REQUEST_MOCK } from '../mocks/auth.mocks';
import { RegisterRequestDto } from '../../src/auth/dto/auth/register-request.dto';
import { UserResponseDto } from '../../src/auth/dto/user/user-response.dto';
import { ConflictException } from '../../src/common/exceptions/confilct.exception';
import { LoginRequestDto } from "../../src/auth/dto/auth/login-request.dto";
import { UnauthorizedException } from "../../src/common/exceptions/unauthorized.exception";
import jwt from "jsonwebtoken";
import { ForbiddenException } from "../../src/common/exceptions/forbidden.exception";

describe('AuthService', () => {
    let service: AuthService;

    const prismaMock = {
        user: {
            create: jest.fn()
        },
        role: {
            findFirst: jest.fn()
        }
    }
    const userServiceMock = {
        findByEmail: jest.fn(),
        findByCpf: jest.fn()
    }
    const passwordServiceMock = {
        encodePassword: jest.fn(),
        passwordMatches: jest.fn()
    }
    const jwtServiceMock = {
        encodeAccessToken: jest.fn(),
        encodeRefreshToken: jest.fn(),
        decodeToken: jest.fn(),
        isTokenValid: jest.fn()
    }
    const refreshTokenServiceMock = {
        saveRefreshToken: jest.fn(),
        deleteRefreshToken: jest.fn(),
        refreshTokenExists: jest.fn()
    }
    const blacklistTokenServiceMock = {
        addToBlacklist: jest.fn(),
    }

    const reqMock = {
        body: {},
        cookies: {},
        headers: {}
    } as any;

    const resMock = {
        cookie: jest.fn()
    } as any;

    let userMock: UserType;
    let roleUserMock: { id: number, authority: string };
    let registerRequestMock: RegisterRequestDto;
    let loginRequestMock: LoginRequestDto
    let userResponseMock: UserResponseDto;
    let jwtPayloadMock: jwt.JwtPayload;

    beforeAll(() => {
        container.registerInstance(PRISMA_SERVICE, prismaMock);
        container.registerInstance(USER_SERVICE, userServiceMock);
        container.registerInstance(PASSWORD_SERVICE, passwordServiceMock);
        container.registerInstance(JWT_SERVICE, jwtServiceMock);
        container.registerInstance(REFRESH_TOKEN_SERVICE, refreshTokenServiceMock);
        container.registerInstance(BLACKLIST_TOKEN_SERVICE, blacklistTokenServiceMock);

        service = container.resolve(AuthService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        userMock = USER_MOCK;
        roleUserMock = ROLE_ADMIN_MOCK;
        registerRequestMock = REGISTER_REQUEST_MOCK;
        loginRequestMock = LOGIN_REQUEST_MOCK;
        userResponseMock = USER_RESPONSE_MOCK;
        jwtPayloadMock = {
            jti: 'tokenId',
            subject: userMock.email,
        }
    });

    describe('register', () => {
        it('should register a new user', async () => {
            userServiceMock.findByEmail.mockResolvedValue(null);
            userServiceMock.findByCpf.mockResolvedValue(null);
            passwordServiceMock.encodePassword.mockResolvedValue('12345');
            prismaMock.role.findFirst.mockResolvedValue(roleUserMock);
            prismaMock.user.create.mockResolvedValue(userMock);

            const result = await service.register(registerRequestMock);

            expect(result).toEqual(userResponseMock);
            expect(userServiceMock.findByEmail).toHaveBeenCalledWith(registerRequestMock.email);
            expect(userServiceMock.findByCpf).toHaveBeenCalledWith(registerRequestMock.cpf);
            expect(passwordServiceMock.encodePassword).toHaveBeenCalledWith(registerRequestMock.password);
            expect(prismaMock.user.create).toHaveBeenCalled();
        });
        it('should throw ConflictException if email already exists', async () => {
            userServiceMock.findByEmail.mockResolvedValue(userMock);
            await expect(service.register(registerRequestMock)).rejects.toThrow(ConflictException);
        });
        it('should throw ConflictException if cpf already exists', async () => {
            userServiceMock.findByEmail.mockResolvedValue(null);
            userServiceMock.findByCpf.mockResolvedValue(userMock);
            await expect(service.register(registerRequestMock)).rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        it('should return access token and set refresh token on cookie', async () => {
            userServiceMock.findByEmail.mockResolvedValue(userMock);
            passwordServiceMock.passwordMatches.mockResolvedValue(true);
            jwtServiceMock.encodeAccessToken.mockReturnValue('accessToken');
            jwtServiceMock.encodeRefreshToken.mockReturnValue('refreshToken');
            const result = await service.login(loginRequestMock, resMock);
            expect(result).toBe('accessToken');
            expect(userServiceMock.findByEmail).toHaveBeenCalledWith(loginRequestMock.email);
            expect(passwordServiceMock.passwordMatches).toHaveBeenCalledWith(loginRequestMock.password, userMock.password);
            expect(resMock.cookie).toHaveBeenCalledWith('refresh_token', 'refreshToken', expect.any(Object));
        });
        it('should throw UnauthorizedException if email does not exist', async () => {
            userServiceMock.findByEmail.mockResolvedValue(null);
            await expect(service.login(loginRequestMock, resMock)).rejects.toThrow(UnauthorizedException);
        });
        it('should throw UnauthorizedException if passwords do not match', async () => {
            userServiceMock.findByEmail.mockResolvedValue(userMock);
            passwordServiceMock.passwordMatches.mockResolvedValue(false);
            await expect(service.login(loginRequestMock, resMock)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('refreshToken', () => {
        it('should return new access token', async () => {
            reqMock.cookies = {
                "refresh_token": "refreshToken"
            }
            jwtServiceMock.isTokenValid.mockReturnValue(true);
            jwtServiceMock.decodeToken.mockReturnValue(jwtPayloadMock);
            refreshTokenServiceMock.refreshTokenExists.mockResolvedValue(true);
            userServiceMock.findByEmail.mockResolvedValue(userMock);
            jwtServiceMock.encodeAccessToken.mockReturnValue('accessToken');

            const result = await service.refreshToken(reqMock);

            expect(result).toBe('accessToken');
            expect(jwtServiceMock.isTokenValid).toHaveBeenCalledWith("refreshToken");
            expect(jwtServiceMock.decodeToken).toHaveBeenCalledWith("refreshToken");
            expect(userServiceMock.findByEmail).toHaveBeenCalledWith(jwtPayloadMock.subject);
            expect(jwtServiceMock.encodeAccessToken).toHaveBeenCalled();
        });
        it('should throw UnauthorizedException if no refresh token is provided', async () => {
            reqMock.cookies = {}
            await expect(service.refreshToken(reqMock)).rejects.toThrow(UnauthorizedException);
        });
        it('should throw UnauthorizedException if refresh token is invalid', async () => {
            reqMock.cookies = {
                "refresh_token": "refreshToken"
            }
            jwtServiceMock.isTokenValid.mockReturnValue(false);
            await expect(service.refreshToken(reqMock)).rejects.toThrow(UnauthorizedException);
        });
        it('should throw UnauthorizedException if refresh token does not exist in Redis', async () => {
            reqMock.cookies = {
                "refresh_token": "refreshToken"
            }
            jwtServiceMock.isTokenValid.mockReturnValue(true);
            jwtServiceMock.decodeToken.mockReturnValue(jwtPayloadMock);
            refreshTokenServiceMock.refreshTokenExists.mockResolvedValue(false);
            await expect(service.refreshToken(reqMock)).rejects.toThrow(UnauthorizedException);
        });
        it('should throw UnauthorizedException if user does not exist', async () => {
            reqMock.cookies = {
                "refresh_token": "refreshToken"
            }
            jwtServiceMock.isTokenValid.mockReturnValue(true);
            jwtServiceMock.decodeToken.mockReturnValue(jwtPayloadMock);
            refreshTokenServiceMock.refreshTokenExists.mockResolvedValue(true);
            userServiceMock.findByEmail.mockResolvedValue(null);
            await expect(service.refreshToken(reqMock)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('logout', () => {
        it('should logout user, delete refresh token and blacklist access token', async () => {
            const tokenValue = 'accessToken';
            reqMock.cookies = {
                "refresh_token": "refreshToken"
            }
            reqMock.headers = {
                authorization: 'Bearer ' + tokenValue
            }
            jwtServiceMock.isTokenValid.mockReturnValue(true);
            jwtServiceMock.decodeToken.mockReturnValue(jwtPayloadMock);
            refreshTokenServiceMock.refreshTokenExists.mockResolvedValue(true);
            jwtServiceMock.decodeToken.mockReturnValue(jwtPayloadMock);

            await service.logout(reqMock, resMock);

            expect(refreshTokenServiceMock.deleteRefreshToken).toHaveBeenCalledWith(jwtPayloadMock.jti);
            expect(resMock.cookie).toHaveBeenCalledWith('refresh_token', '', expect.any(Object));
            expect(jwtServiceMock.decodeToken).toHaveBeenCalledWith(tokenValue);
            expect(blacklistTokenServiceMock.addToBlacklist).toHaveBeenCalledWith(jwtPayloadMock, tokenValue);
        });
        it('should throw UnauthorizedException if no refresh token is provided', async () => {
            reqMock.cookies = {}
            await expect(service.logout(reqMock, resMock)).rejects.toThrow(UnauthorizedException);
        });
        it('should throw UnauthorizedException if refresh token is invalid', async () => {
            reqMock.cookies = {
                "refresh_token": "refreshToken"
            }
            jwtServiceMock.isTokenValid.mockReturnValue(false);
            await expect(service.logout(reqMock, resMock)).rejects.toThrow(UnauthorizedException);
        });
        it('should throw UnauthorizedException if refresh token does not exist in Redis', async () => {
            reqMock.cookies = {
                "refresh_token": "refreshToken"
            }
            jwtServiceMock.isTokenValid.mockReturnValue(true);
            jwtServiceMock.decodeToken.mockReturnValue(jwtPayloadMock);
            refreshTokenServiceMock.refreshTokenExists.mockResolvedValue(false);
            await expect(service.logout(reqMock, resMock)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('isAdminOrResourceOwner', () => {
        it('should not throw if user is admin', () => {
            userMock.roles = [ { role: ROLE_ADMIN_MOCK } ];
            expect(() => service.isAdminOrResourceOwner(userMock, 2)).not.toThrow();
        });
        it('should not throw if user is resource owner', () => {
            userMock.roles = [ { role: ROLE_USER_MOCK } ];
            expect(() => service.isAdminOrResourceOwner(userMock, userMock.id)).not.toThrow();
        });
        it('should throw ForbiddenException if user is neither admin nor resource owner', () => {
            userMock.roles = [ { role: ROLE_USER_MOCK } ];
            expect(() => service.isAdminOrResourceOwner(userMock, 2)).toThrow(ForbiddenException);
        });
    });

});