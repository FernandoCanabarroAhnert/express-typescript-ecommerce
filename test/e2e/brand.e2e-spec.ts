import request from 'supertest';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedTestContainer } from 'testcontainers';
import { seedData } from '../utils/seed-data.utils';
import { PrismaClient } from '@prisma/client';
import { obtainAuthToken } from '../utils/token.utils';
import { setTestEnvironmentVariables } from '../utils/env.utils';
import { startContainers } from '../utils/containers.utils';
import { PageResponseDto } from '../../src/common/dto/page/page-response.dto';
import { BrandResponseDto } from '../../src/products/dto/brand/brand-response.dto';
import { CreateBrandDto } from '../../src/products/dto/brand/create-brand.dto';
import { UpdateBrandDto } from '../../src/products/dto/brand/update-brand.dto';
import { BRAND_REQUEST_MOCK } from '../mocks/brands.mocks';

describe('Brand E2E', () => {
    let postgresContainer: StartedPostgreSqlContainer;
    let redisContainer: StartedTestContainer;
    let app: any;
    let prisma: PrismaClient;
    const existingId = 1;
    const nonExistingId = 999;
    let createBrandDto: CreateBrandDto;
    let updateBrandDto: UpdateBrandDto;
    let createdBrandId: number;
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
        createBrandDto = BRAND_REQUEST_MOCK;
        updateBrandDto = { ...createBrandDto, name: 'Marca Update', description: 'Descrição Update' } as UpdateBrandDto;
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

    describe('GET /brands', () => {
        it('should return a paginated list of brands', async () => {
            await request(app)
                .get('/brands')
                .expect(200)
                .then((response) => {
                    expect(response.status).toBe(200);
                    const pageResponse: PageResponseDto<BrandResponseDto> = response.body;
                    expect(pageResponse.data.length).toBe(1);
                    expect(pageResponse.currentPage).toBe(1);
                    expect(pageResponse.totalPages).toBe(1);
                    expect(pageResponse.numberOfItems).toBe(1);
                    expect(pageResponse.totalItems).toBe(1);
                    expect(pageResponse.data[0].id).toBe(1);
                    expect(pageResponse.data[0].name).toBe('Marca Teste');
                    expect(pageResponse.data[0].description).toBe('Descrição da Marca');
                });
        });
    });

    describe('GET /brands/:id', () => {
        it('should return a brand by ID', async () => {
            await request(app)
                .get(`/brands/${existingId}`)
                .expect(200)
                .then((response) => {
                    expect(response.status).toBe(200);
                    const body: BrandResponseDto = response.body;
                    expect(body.id).toBe(1);
                    expect(body.name).toBe('Marca Teste');
                    expect(body.description).toBe('Descrição da Marca');
                });
        });
        it('should return 404 for non-existing brand ID', async () => {
            await request(app)
                .get(`/brands/${nonExistingId}`)
                .expect(404);
        });
    });

    describe('POST /brands', () => {
        it('should create a new brand', async () => {
            await request(app)
                .post('/brands')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createBrandDto)
                .expect(201)
                .then((response) => {
                    const body: BrandResponseDto = response.body;
                    expect(body.id).toBeDefined();
                    createdBrandId = body.id;
                    expect(body.name).toBe(createBrandDto.name);
                    expect(body.description).toBe(createBrandDto.description);
                });
        });
        it('should return 400 when name is invalid', async () => {
            await request(app)
                .post('/brands')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...createBrandDto, name: '' })
                .expect(400);
        });
        it('should return 400 when description is invalid', async () => {
            await request(app)
                .post('/brands')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...createBrandDto, description: '' })
                .expect(400);
        });
        it('should return 401 when no token is provided', async () => {
            await request(app)
                .post('/brands')
                .send(createBrandDto)
                .expect(401);
        });
        it('should return 403 when user token is not admin', async () => {
            await request(app)
                .post('/brands')
                .set('Authorization', `Bearer ${userToken}`)
                .send(createBrandDto)
                .expect(403);
        });
    });

    describe('PATCH /brands/:id', () => {
        it('should create a new brand', async () => {
            await request(app)
                .patch(`/brands/${existingId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateBrandDto)
                .expect(200)
                .then((response) => {
                    const body: BrandResponseDto = response.body;
                    expect(body.id).toBeDefined();
                    expect(body.name).toBe(updateBrandDto.name);
                    expect(body.description).toBe(updateBrandDto.description);
                });
        });
        it('should return 400 when name is invalid', async () => {
            await request(app)
                .patch(`/brands/${existingId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...updateBrandDto, name: '' })
                .expect(400);
        });
        it('should return 400 when description is invalid', async () => {
            await request(app)
                .patch(`/brands/${existingId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...updateBrandDto, description: '' })
                .expect(400);
        });
        it('should return 401 when no token is provided', async () => {
            await request(app)
                .patch(`/brands/${existingId}`)
                .send(updateBrandDto)
                .expect(401);
        });
        it('should return 403 when user token is not admin', async () => {
            await request(app)
                .patch(`/brands/${existingId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateBrandDto)
                .expect(403);
        });
        it('should return 404 when product is not found', async () => {
            await request(app)
                .patch(`/brands/${nonExistingId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateBrandDto)
                .expect(404);''
        })
    });

    describe('DELETE /brands/:id', () => {
        it('should delete a brand by ID', async () => {
            await request(app)
                .delete(`/brands/${createdBrandId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(204);
        });
        it('should return 401 when no token is provided', async () => {
            await request(app)
                .delete(`/brands/${createdBrandId}`)
                .expect(401);
        });
        it('should return 403 when user token is not admin', async () => {
            await request(app)
                .delete(`/brands/${createdBrandId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
        });
        it('should return 404 for non-existing brand ID', async () => {
            await request(app)
                .delete(`/brands/${createdBrandId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });

});