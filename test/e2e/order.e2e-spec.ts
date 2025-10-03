import request from 'supertest';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedTestContainer } from 'testcontainers';
import { seedData } from '../utils/seed-data.utils';
import { PrismaClient } from '@prisma/client';
import { obtainAuthToken } from '../utils/token.utils';
import { setTestEnvironmentVariables } from '../utils/env.utils';
import { startContainers } from '../utils/containers.utils';
import { PageResponseDto } from '../../src/common/dto/page/page-response.dto';
import { CreateOrderDto } from '../../src/orders/dto/create-order.dto';
import { ORDER_REQUEST_MOCK } from '../mocks/orders.mocks';
import { OrderDetailsResponseDto } from '../../src/orders/dto/order-details-response.dto';
import { OrderMinResponseDto } from '../../src/orders/dto/order-min-response.dto';

describe('Order E2E', () => {
    let postgresContainer: StartedPostgreSqlContainer;
    let redisContainer: StartedTestContainer;
    let app: any;
    let prisma: PrismaClient;
    const existingId = 1;
    const nonExistingId = 999;
    let createOrderDto: CreateOrderDto;
    let adminEmail: string;
    let adminPassword: string;
    let userEmail: string;
    let userPassword: string;
    let adminToken: string;
    let userToken: string;

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
        createOrderDto = ORDER_REQUEST_MOCK;
        adminEmail = 'john.doe@example.com';
        adminPassword = '12345';
        userEmail = 'maria.silva@example.com';
        userPassword = '12345';
        adminToken = (await obtainAuthToken(app, adminEmail, adminPassword)).accessToken;
        userToken = (await obtainAuthToken(app, userEmail, userPassword)).accessToken;
    }, 120000);

    afterAll(async () => {
        await prisma?.$disconnect();
        await postgresContainer.stop();
        await redisContainer.stop();
    }, 120000);

    describe('GET /orders', () => {
        it('should return 200 and a page of orders for admin', async () => {
            await request(app)
                .get('/orders')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .then(response => {
                    const pageResponse: PageResponseDto<OrderMinResponseDto> = response.body;
                    expect(pageResponse).toBeDefined();
                    const order = pageResponse.data[0];
                    expect(order).toBeDefined();
                    expect(order.id).toBe(existingId);
                    expect(order.amount).toBe("123.45");
                    expect(order.user).toBeDefined();
                    expect(order.user.id).toBe(1);
                });
        });
        it('should return 401 when no token is provided', async () => {
            await request(app)
                .get('/orders')
                .expect(401);
        });
        it('should return 403 when user is not admin', async () => {
            await request(app)
                .get('/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
        });
    });

    describe('GET /orders/:id', () => {
        it('should return 200 and the order for admin', async () => {
            await request(app)
                .get(`/orders/${existingId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .then(response => {
                    const body: OrderDetailsResponseDto = response.body;
                    expect(body).toBeDefined();
                    expect(body.id).toBe(existingId);
                    expect(body.amount).toBe("123.45");
                    expect(body.user).toBeDefined();
                    expect(body.user.id).toBe(1);
                    expect(body.items).toBeDefined();
                    expect(body.items.length).toBe(1);
                });
        });
        it('should return 401 when no token is provided', async () => {
            await request(app)
                .get(`/orders/${existingId}`)
                .expect(401);
        });
        it('should return 403 when user is not admin or the resource owner', async () => {
            await request(app)
                .get(`/orders/${existingId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
        });
        it('should return 404 when order does not exist', async () => {
            await request(app)
                .get(`/orders/${nonExistingId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });

    describe('POST /orders', () => {
        it('should return 201 and the created order for user', async () => {
            await request(app)
                .post('/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(createOrderDto)
                .expect(201)
                .then(response => {
                    const body: OrderDetailsResponseDto = response.body;
                    expect(body).toBeDefined();
                    expect(body.id).toBeDefined();
                    expect(body.amount).toBe("123.45");
                    expect(body.user).toBeDefined();
                    expect(body.user.id).toBe(2);
                    expect(body.items).toBeDefined();
                    expect(body.items.length).toBe(createOrderDto.items.length);
                })
        });
        it('should return 401 when no token is provided', async () => {
            await request(app)
                .post('/orders')
                .send(createOrderDto)
                .expect(401);
        });
    });

});