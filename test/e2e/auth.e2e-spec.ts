import request from 'supertest';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedTestContainer } from 'testcontainers';
import { seedData } from '../utils/seed-data.utils';
import { PrismaClient } from '@prisma/client';
import { obtainAuthToken } from '../utils/token.utils';
import { setTestEnvironmentVariables } from '../utils/env.utils';
import { startContainers } from '../utils/containers.utils';
import { RegisterRequestDto } from '../../src/auth/dto/auth/register-request.dto';
import { LoginRequestDto } from '../../src/auth/dto/auth/login-request.dto';
import { REGISTER_REQUEST_MOCK, LOGIN_REQUEST_MOCK } from '../mocks/auth.mocks';
import { UserResponseDto } from '../../src/auth/dto/user/user-response.dto';
import { RolesEnum } from '../../src/common/enums/roles.enum';

describe('Auth E2E', () => {
    let postgresContainer: StartedPostgreSqlContainer;
    let redisContainer: StartedTestContainer;
    let app: any;
    let prisma: PrismaClient;
    let registerRequestDto: RegisterRequestDto;
    let loginRequestDto: LoginRequestDto;
    let adminEmail: string;
    let adminPassword: string;
    let userEmail: string;
    let userPassword: string;
    let userToken: string;
    let refreshTokenCookie: string[];

    beforeAll(async () => {
        const { startedPostgresContainer, startedRedisContainer, postgresUrl, redisUrl } = await startContainers();
        postgresContainer = startedPostgresContainer;
        redisContainer = startedRedisContainer;

        setTestEnvironmentVariables(postgresUrl, redisUrl);

        const mod = await import('../../src/index');
        app = mod.default;

        prisma = new PrismaClient();
        await seedData(prisma);
    }, 120000);

    beforeEach(async () => {
        registerRequestDto = REGISTER_REQUEST_MOCK;
        loginRequestDto = LOGIN_REQUEST_MOCK;
        adminEmail = 'john.doe@example.com';
        adminPassword = '12345';
        userEmail = 'maria.silva@example.com';
        userPassword = '12345';
        const { accessToken, cookies } = await obtainAuthToken(app, userEmail, userPassword);
        userToken = accessToken;
        refreshTokenCookie = cookies;
    }, 120000);

    afterAll(async () => {
        await prisma?.$disconnect();
        await postgresContainer.stop();
        await redisContainer.stop();
    }, 120000);

    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            await request(app)
                .post('/auth/register')
                .send(registerRequestDto)
                .expect(201)
                .then(response => {
                    const body: UserResponseDto = response.body;
                    expect(body).toHaveProperty('id');
                    expect(body.fullName).toBe(registerRequestDto.fullName);
                    expect(body.email).toBe(registerRequestDto.email);
                    expect(body.cpf).toBe(registerRequestDto.cpf);
                    expect(body.roles[0].authority).toBe(RolesEnum.USER);
                });
        });
        it('should return 400 if fullName is invalid', async () => {
            await request(app)
                .post('/auth/register')
                .send({ ...registerRequestDto, fullName: '' })
                .expect(400);
        });
        it('should return 400 if email is invalid', async () => {
            await request(app)
                .post('/auth/register')
                .send({ ...registerRequestDto, email: 'invalid-email' })
                .expect(400);
        });
        it('should return 400 if password is invalid', async () => {
            await request(app)
                .post('/auth/register')
                .send({ ...registerRequestDto, password: '' })
                .expect(400);
        });
        it('should return 400 if cpf is invalid', async () => {
            await request(app)
                .post('/auth/register')
                .send({ ...registerRequestDto, cpf: '12345678900' })
                .expect(400);
        });
        it('should return 400 if birthDate is invalid', async () => {
            await request(app)
                .post('/auth/register')
                .send({ ...registerRequestDto, birthDate: 'invalid-date' })
                .expect(400);
        });
    });

    describe('POST /auth/login', () => {
        it('should login an existing user', async () => {
            await request(app)
                .post('/auth/login')
                .send(loginRequestDto)
                .expect(200)
                .then(response => {
                    const body = response.body;
                    expect(body).toHaveProperty('accessToken');
                    const cookies = response.headers['set-cookie'];
                    expect(cookies).toBeDefined();
                });
        });
        it('should return 400 if email is invalid', async () => {
            await request(app)
                .post('/auth/login')
                .send({ ...loginRequestDto, email: 'invalid-email' })
                .expect(400);
        });
        it('should return 400 if password is invalid', async () => {
            await request(app)
                .post('/auth/login')
                .send({ ...loginRequestDto, password: '' })
                .expect(400);
        });
        it('should return 401 if email is invalid', async () => {
            await request(app)
                .post('/auth/login')
                .send({ ...loginRequestDto, email: 'nonexistingemail@example.com' })
                .expect(401);
        });
        it('should return 401 if password is invalid', async () => {
            await request(app)
                .post('/auth/login')
                .send({ ...loginRequestDto, password: 'wrong-password' })
                .expect(401);
        });
    });

    describe('POST /auth/refresh-token', () => {
        it('should refresh token for an authenticated user', async () => {
            await request(app)
                .post('/auth/refresh-token')
                .set('Cookie', refreshTokenCookie)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200)
                .then(response => {
                    const body = response.body;
                    expect(body).toHaveProperty('accessToken');
                });
        });
        it('should return 401 if no access token is provided', async () => {
            await request(app)
                .post('/auth/refresh-token')
                .expect(401);
        });
        it('should return 401 if no refresh token cookie is provided', async () => {
            await request(app)
                .post('/auth/refresh-token')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(401);
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout an authenticated user', async () => {
            await request(app)
                .post('/auth/logout')
                .set('Cookie', refreshTokenCookie)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(204);
        });
        it('should return 401 if no access token is provided', async () => {
            await request(app)
                .post('/auth/logout')
                .expect(401);
        });
        it('should return 401 if no refresh token cookie is provided', async () => {
            await request(app)
                .post('/auth/logout')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(401);
        });
    });

});