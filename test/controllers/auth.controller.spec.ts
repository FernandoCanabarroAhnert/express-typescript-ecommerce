import "reflect-metadata";

import { AuthController } from '../../src/auth/controllers/auth.controller';
import { container } from "tsyringe";
import { AUTH_SERVICE } from "../../src/common/constants/services.constants";
import { LoginRequestDto } from "../../src/auth/dto/auth/login-request.dto";
import { RegisterRequestDto } from "../../src/auth/dto/auth/register-request.dto";
import { UserResponseDto } from "../../src/auth/dto/user/user-response.dto";
import { REGISTER_REQUEST_MOCK, LOGIN_REQUEST_MOCK } from "../mocks/auth.mocks";
import { USER_RESPONSE_MOCK } from "../mocks/users.mocks";

describe('AuthController', () => {
    let controller: AuthController;

    const authServiceMock = {
        register: jest.fn(),
        login: jest.fn(),
        refreshToken: jest.fn(),
        logout: jest.fn(),
    }

    const reqMock = {
        body: {},
        cookies: {},
        headers: {}
    } as any;
    const resMock = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        cookie: jest.fn()
    } as any;
    const nextMock = jest.fn();

    let registerRequestMock: RegisterRequestDto;
    let loginRequestMock: LoginRequestDto
    let userResponseMock: UserResponseDto;

    beforeAll(() => {
        container.registerInstance(AUTH_SERVICE, authServiceMock);
        controller = container.resolve(AuthController);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        registerRequestMock = REGISTER_REQUEST_MOCK;
        loginRequestMock = LOGIN_REQUEST_MOCK;
        userResponseMock = USER_RESPONSE_MOCK;
    });

    describe('register', () => {
        it('should register a new user', async () => {
            reqMock.body = registerRequestMock;
            authServiceMock.register.mockResolvedValue(userResponseMock);
            await controller.register(reqMock, resMock, nextMock);
            expect(authServiceMock.register).toHaveBeenCalledWith(registerRequestMock);
            expect(resMock.status).toHaveBeenCalledWith(201);
        });
    });

    describe('login', () => {
        it('should login a user and return access token', async () => {
            reqMock.body = loginRequestMock;
            authServiceMock.login.mockResolvedValue('accessToken');
            await controller.login(reqMock, resMock, nextMock);
            expect(authServiceMock.login).toHaveBeenCalledWith(loginRequestMock, resMock);
            expect(resMock.json).toHaveBeenCalledWith({ accessToken: 'accessToken' });
        });
    });

    describe('refreshToken', () => {
        it('should refresh the access token', async () => {
            reqMock.cookies = {
                'refresh_token': 'refreshToken'
            }
            authServiceMock.refreshToken.mockResolvedValue('newAccessToken');
            await controller.refreshToken(reqMock, resMock, nextMock);
            expect(authServiceMock.refreshToken).toHaveBeenCalledWith(reqMock);
            expect(resMock.json).toHaveBeenCalledWith({ accessToken: 'newAccessToken' });
        });
    });

    describe('logout', () => {
        it('should logout the user', async () => {
            reqMock.cookies = {
                'refresh_token': 'refreshToken'
            }
            await controller.logout(reqMock, resMock, nextMock);
            expect(authServiceMock.logout).toHaveBeenCalledWith(reqMock, resMock);
            expect(resMock.status).toHaveBeenCalledWith(204);
        });
    });

});