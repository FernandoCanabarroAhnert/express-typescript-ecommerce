import request from 'supertest';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedTestContainer } from 'testcontainers';
import { seedData } from '../utils/seed-data.utils';
import { PrismaClient } from '@prisma/client';
import { obtainAuthToken } from '../utils/token.utils';
import { setTestEnvironmentVariables } from '../utils/env.utils';
import { startContainers } from '../utils/containers.utils';
import { PageResponseDto } from '../../src/common/dto/page/page-response.dto';
import { CreateCategoryDto } from '../../src/products/dto/category/create-category.dto'
import { UpdateCategoryDto } from '../../src/products/dto/category/update-category.dto'
import { CATEGORY_REQUEST_MOCK } from '../mocks/categories.mocks';
import { CategoryResponseDto } from '../../src/products/dto/category/category-response.dto';

describe('Category E2E', () => {
    let postgresContainer: StartedPostgreSqlContainer;
    let redisContainer: StartedTestContainer;
    let app: any;
    let prisma: PrismaClient;
    const existingId = 1;
    const nonExistingId = 999;
    let createCategoryDto: CreateCategoryDto;
    let updateCategoryDto: UpdateCategoryDto;
    let createdCategoryId: number;
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
        createCategoryDto = CATEGORY_REQUEST_MOCK;
        updateCategoryDto = { ...createCategoryDto, name: 'Categoria Update', description: 'Descrição Update' } as UpdateCategoryDto;
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

    describe('GET /categories', () => {
        it('should return a paginated list of brands', async () => {
            await request(app)
                .get('/categories')
                .expect(200)
                .then((response) => {
                    expect(response.status).toBe(200);
                    const pageResponse: PageResponseDto<CategoryResponseDto> = response.body;
                    expect(pageResponse.data.length).toBe(1);
                    expect(pageResponse.currentPage).toBe(1);
                    expect(pageResponse.totalPages).toBe(1);
                    expect(pageResponse.numberOfItems).toBe(1);
                    expect(pageResponse.totalItems).toBe(1);
                    expect(pageResponse.data[0].id).toBe(1);
                    expect(pageResponse.data[0].name).toBe('Categoria Teste');
                    expect(pageResponse.data[0].description).toBe('Descrição da Categoria');
                });
        });
    });

    describe('GET /categories/:id', () => {
        it('should return a category by ID', async () => {
            await request(app)
                .get(`/categories/${existingId}`)
                .expect(200)
                .then((response) => {
                    expect(response.status).toBe(200);
                    const body: CategoryResponseDto = response.body;
                    expect(body.id).toBe(1);
                    expect(body.name).toBe('Categoria Teste');
                    expect(body.description).toBe('Descrição da Categoria');
                });
        });
        it('should return 404 for non-existing brand ID', async () => {
            await request(app)
                .get(`/categories/${nonExistingId}`)
                .expect(404);
        });
    });

    describe('POST /categories', () => {
        it('should create a new category', async () => {
            await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createCategoryDto)
                .expect(201)
                .then((response) => {
                    const body: CategoryResponseDto = response.body;
                    expect(body.id).toBeDefined();
                    createdCategoryId = body.id;
                    expect(body.name).toBe(createCategoryDto.name);
                    expect(body.description).toBe(createCategoryDto.description);
                });
        });
        it('should return 400 when name is invalid', async () => {
            await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...createCategoryDto, name: '' })
                .expect(400);
        });
        it('should return 400 when description is invalid', async () => {
            await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...createCategoryDto, description: '' })
                .expect(400);
        });
        it('should return 401 when no token is provided', async () => {
            await request(app)
                .post('/categories')
                .send(createCategoryDto)
                .expect(401);
        });
        it('should return 403 when user token is not admin', async () => {
            await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${userToken}`)
                .send(createCategoryDto)
                .expect(403);
        });
    });

    describe('PATCH /categories/:id', () => {
        it('should create a new category', async () => {
            await request(app)
                .patch(`/categories/${existingId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateCategoryDto)
                .expect(200)
                .then((response) => {
                    const body: CategoryResponseDto = response.body;
                    expect(body.id).toBeDefined();
                    expect(body.name).toBe(updateCategoryDto.name);
                    expect(body.description).toBe(updateCategoryDto.description);
                });
        });
        it('should return 400 when name is invalid', async () => {
            await request(app)
                .patch(`/categories/${existingId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...updateCategoryDto, name: '' })
                .expect(400);
        });
        it('should return 400 when description is invalid', async () => {
            await request(app)
                .patch(`/categories/${existingId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...updateCategoryDto, description: '' })
                .expect(400);
        });
        it('should return 401 when no token is provided', async () => {
            await request(app)
                .patch(`/categories/${existingId}`)
                .send(updateCategoryDto)
                .expect(401);
        });
        it('should return 403 when user token is not admin', async () => {
            await request(app)
                .patch(`/categories/${existingId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateCategoryDto)
                .expect(403);
        });
        it('should return 404 when product is not found', async () => {
            await request(app)
                .patch(`/categories/${nonExistingId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateCategoryDto)
                .expect(404);''
        })
    });

    describe('DELETE /categories/:id', () => {
        it('should delete a brand by ID', async () => {
            await request(app)
                .delete(`/categories/${createdCategoryId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(204);
        });
        it('should return 401 when no token is provided', async () => {
            await request(app)
                .delete(`/categories/${createdCategoryId}`)
                .expect(401);
        });
        it('should return 403 when user token is not admin', async () => {
            await request(app)
                .delete(`/categories/${createdCategoryId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
        });
        it('should return 404 for non-existing brand ID', async () => {
            await request(app)
                .delete(`/categories/${createdCategoryId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });

});