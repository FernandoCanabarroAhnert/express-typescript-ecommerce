import request from 'supertest';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { execSync } from 'child_process';
import { seedData } from '../utils/seed-data.utils';
import { PageResponseDto } from '../../src/common/dto/page/page-response.dto';
import { ProductResponseDto } from '../../src/products/dto/product/product-response.dto';
import { CreateProductDto } from '../../src/products/dto/product/create-product.dto';
import { PRODUCT_REQUEST_MOCK } from '../mocks/products.mocks';
import { UpdateProductDto } from '../../src/products/dto/product/update-product.dto';
import { PrismaClient } from '@prisma/client';

describe('Products E2E', () => {
    let postgresContainer: StartedPostgreSqlContainer;
    let redisContainer: StartedTestContainer;
    let app: any;
    let prisma: PrismaClient;
    const existingId = 1;
    const nonExistingId = 999;
    let createProductDto: CreateProductDto;
    let createdProductId: number;
    let updateProductDto: UpdateProductDto;

    beforeAll(async () => {
        postgresContainer = await new PostgreSqlContainer('postgres:16')
            .withExposedPorts(5432)
            .withUsername('postgres')
            .withPassword('1234567')
            .withDatabase('products')
            .start();
        redisContainer = await new GenericContainer('redis:6.2')
            .withExposedPorts(6379)
            .start();
        const url = postgresContainer.getConnectionUri();
        const redisUrl = `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`;
        process.env.DATABASE_URL = url;
        process.env.REDIS_URL = redisUrl;
        
        execSync('npx prisma migrate deploy', { env: { ...process.env } });

        const mod = await import('../../src/index');
        app = mod.default;

        prisma = new PrismaClient();
        await seedData(prisma);
    }, 120000);

    beforeEach(() => {
        createProductDto = PRODUCT_REQUEST_MOCK;
        updateProductDto = createProductDto as UpdateProductDto;
    })

    afterAll(async () => {
        await prisma?.$disconnect();
        await postgresContainer.stop();
        await redisContainer.stop();
    });

    describe('GET /products', () => {
        it('should return products paginated without query params', async () => {
            await request(app)
                .get('/products')
                .expect(200)
                .then(response => {
                    const page: PageResponseDto<ProductResponseDto> = response.body;
                    expect(page.currentPage).toBe(1);
                    expect(page.totalPages).toBe(1);
                    expect(page.numberOfItems).toBe(1);
                    expect(page.totalItems).toBe(1);
                    const products = page.data;
                    expect(products[0]).toHaveProperty('id', existingId);
                    expect(products[0]).toHaveProperty('name', 'Produto de Teste');
                    expect(products[0]).toHaveProperty('description', 'Descrição');
                    expect(products[0]).toHaveProperty('price', "123.45");
                })
        });
        it('should return products paginated with query params', async () => {
            await request(app)
                .get('/products?page=1&size=5&sort=name&order=asc')
                .expect(200)
                .then(response => {
                    const page: PageResponseDto<ProductResponseDto> = response.body;
                    expect(page.currentPage).toBe(1);
                    expect(page.totalPages).toBe(1);
                    expect(page.numberOfItems).toBe(1);
                    expect(page.totalItems).toBe(1);
                    const products = page.data;
                    expect(products[0]).toHaveProperty('id', existingId);
                    expect(products[0]).toHaveProperty('name', 'Produto de Teste');
                    expect(products[0]).toHaveProperty('description', 'Descrição');
                    expect(products[0]).toHaveProperty('price', "123.45");
                })
        });
    })

    describe('GET /products/:id', () => {
        it('should return a product by id', async () => {
            await request(app)
                .get(`/products/${existingId}`)
                .expect(200)
                .then(response => {
                    const product = response.body;
                    expect(product).toHaveProperty('id', existingId);
                    expect(product).toHaveProperty('name', 'Produto de Teste');
                    expect(product).toHaveProperty('description', 'Descrição');
                    expect(product).toHaveProperty('price', "123.45");
                });
        });
        it('should return 400 if id is invalid', async () => {
            await request(app)
                .get('/products/fahui4y1987')
                .expect(400);
        })
        it('should return 404 if product does not exist', async () => {
            await request(app)
                .get(`/products/${nonExistingId}`)
                .expect(404);
        });
    });

    describe('POST /products', () => {
        it('should return 201 and create a new product', async () => {
            await request(app)
                .post('/products')
                .send(createProductDto)
                .expect(201)
                .then(response => {
                    const product = response.body;
                    createdProductId = product.id;
                    expect(product).toHaveProperty('id', 2);
                    expect(product).toHaveProperty('name', createProductDto.name);
                    expect(product).toHaveProperty('description', createProductDto.description);
                    expect(product).toHaveProperty('price', createProductDto.price.toString());
                });
        });
        it('should return 400 if name is blank', async () => {
            await request(app)
                .post('/products')
                .send({ ...createProductDto, name: '' })
                .expect(400);
        });
        it('should return 400 if description is blank', async () => {
            await request(app)
                .post('/products')
                .send({ ...createProductDto, description: '' })
                .expect(400);
        });
        it('should return 400 if price is null', async () => {
            await request(app)
                .post('/products')
                .send({ ...createProductDto, price: null })
                .expect(400);
        });
        it('should return 400 if price is negative', async () => {
            await request(app)
                .post('/products')
                .send({ ...createProductDto, price: -1 })
                .expect(400);
        });
        it('should return 400 if brandId is null', async () => {
            await request(app)
                .post('/products')
                .send({ ...createProductDto, brandId: null })
                .expect(400);
        });
        it('should return 400 if categoriesIds is empty', async () => {
            await request(app)
                .post('/products')
                .send({ ...createProductDto, categoriesIds: [] })
                .expect(400);
        });
        it('should return 404 if brand does not exist', async () => {
            await request(app)
                .post('/products')
                .send({ ...createProductDto, brandId: nonExistingId })
                .expect(404);
        });
        it('should return 404 if category does not exist', async () => {
            await request(app)
                .post('/products')
                .send({ ...createProductDto, categoriesIds: [nonExistingId] })
                .expect(404);
        });
    });

    describe('PATCH /products/:id', () => {
        it('should return 200 and update a product', async () => {
            await request(app)
                .patch(`/products/${createdProductId}`)
                .send({ ...updateProductDto, name: 'Updated Product', description: 'Updated Description' })
                .expect(200)
                .then(response => {
                    const product = response.body;
                    expect(product).toHaveProperty('id', createdProductId);
                    expect(product).toHaveProperty('name', 'Updated Product');
                    expect(product).toHaveProperty('description', 'Updated Description');
                    expect(product).toHaveProperty('price', createProductDto.price.toString());
                });
        });
        it('should return 400 if id is invalid', async () => {
            await request(app)
                .patch('/products/agjh1989824g5hb')
                .send(updateProductDto)
                .expect(400);
        });
        it('should return 404 if product does not exist', async () => {
            await request(app)
                .patch(`/products/${nonExistingId}`)
                .send(updateProductDto)
                .expect(404);
        });
        it('should return 400 if name is blank', async () => {
            await request(app)
                .patch(`/products/${createdProductId}`)
                .send({ ...updateProductDto, name: '' })
                .expect(400);
        });
        it('should return 400 if description is blank', async () => {
            await request(app)
                .patch(`/products/${createdProductId}`)
                .send({ ...updateProductDto, description: '' })
                .expect(400);
        });
        it('should return 400 if price is null', async () => {
            await request(app)
                .patch(`/products/${createdProductId}`)
                .send({ ...updateProductDto, price: null })
                .expect(400);
        });
        it('should return 400 if price is negative', async () => {
            await request(app)
                .patch(`/products/${createdProductId}`)
                .send({ ...updateProductDto, price: -1 })
                .expect(400);
        });
        it('should return 400 if brandId is null', async () => {
            await request(app)
                .patch(`/products/${createdProductId}`)
                .send({ ...updateProductDto, brandId: null })
                .expect(400);
        });
        it('should return 400 if categoriesIds is empty', async () => {
            await request(app)
                .patch(`/products/${createdProductId}`)
                .send({ ...updateProductDto, categoriesIds: [] })
                .expect(400);
        });
        it('should return 404 if brand does not exist', async () => {
            await request(app)
                .patch(`/products/${createdProductId}`)
                .send({ ...updateProductDto, brandId: nonExistingId })
                .expect(404);
        });
        it('should return 404 if category does not exist', async () => {
            await request(app)
                .patch(`/products/${createdProductId}`)
                .send({ ...updateProductDto, categoriesIds: [nonExistingId] })
                .expect(404);
        });
    })

    describe('DELETE /products/:id', () => {
        it('should return 204 and delete a product', async () => {
            await request(app)
                .delete(`/products/${createdProductId}`)
                .expect(204);
        });
        it('should return 400 if id is invalid', async () => {
            await request(app)
                .delete('/products/agjh1989824g5hb')
                .expect(400);
        });
        it('should return 404 if product does not exist', async () => {
            await request(app)
                .delete(`/products/${nonExistingId}`)
                .expect(404);
        });
    })

});