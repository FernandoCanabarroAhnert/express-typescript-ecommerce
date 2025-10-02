import "reflect-metadata";

import { container } from "tsyringe";
import { OrderService } from '../../src/orders/services/order.service';
import { PRISMA_SERVICE, AUTH_SERVICE, PRODUCT_SERVICE } from "../../src/common/constants/services.constants";
import { OrderDetailsType } from "../../src/orders/types/order-details.type";
import { OrderMinType } from "../../src/orders/types/order-min.type";
import { OrderDetailsResponseDto } from "../../src/orders/dto/order-details-response.dto";
import { OrderMinResponseDto } from "../../src/orders/dto/order-min-response.dto";
import { CreateOrderDto } from "../../src/orders/dto/create-order.dto";
import { PageResponseDto } from "../../src/common/dto/page/page-response.dto";
import { ORDER_DETAILS_MOCK, ORDER_DETAILS_RESPONSE_MOCK, ORDER_MIN_MOCK, ORDER_MIN_RESPONSE_MOCK, ORDER_REQUEST_MOCK } from "../mocks/orders.mocks";
import { UserType } from "../../src/auth/types/user.type";
import { USER_MOCK } from "../mocks/users.mocks";
import { NotFoundException } from "../../src/common/exceptions/not-found.exception";
import { ForbiddenException } from "../../src/common/exceptions/forbidden.exception";
import { PRODUCT_RESPONSE_MOCK } from "../mocks/products.mocks";

describe('OrderService', () => {
    let service: OrderService;

    const prismaMock = {
        order: {
            count: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
        }
    }
    const productServiceMock = {
        findById: jest.fn()
    }
    const authServiceMock = {
        isAdminOrResourceOwner: jest.fn()
    }

    const existingId = 1;
    const nonExistingId = 2;
    let userMock: UserType;
    let orderDetailsMock: OrderDetailsType;
    let orderMinMock: OrderMinType;
    let orderDetailsResponseMock: OrderDetailsResponseDto;
    let orderMinResponseMock: OrderMinResponseDto;
    let orderRequestMock: CreateOrderDto;
    let pageResponse: PageResponseDto<OrderMinResponseDto>;

    beforeAll(() => {
        container.registerInstance(PRISMA_SERVICE, prismaMock);
        container.registerInstance(PRODUCT_SERVICE, productServiceMock);
        container.registerInstance(AUTH_SERVICE, authServiceMock);

        service = container.resolve(OrderService);
    });

    beforeEach(() => {
        userMock = USER_MOCK;
        orderDetailsMock = ORDER_DETAILS_MOCK;
        orderMinMock = ORDER_MIN_MOCK;
        orderDetailsResponseMock = ORDER_DETAILS_RESPONSE_MOCK;
        orderMinResponseMock = ORDER_MIN_RESPONSE_MOCK;
        orderRequestMock = ORDER_REQUEST_MOCK;
        pageResponse = {
            data: [orderMinResponseMock],
            currentPage: 1,
            totalPages: 1,
            numberOfItems: 1,
            totalItems: 1
        };
    });

    describe('findAll', () => {
        it('should return a paginated list of orders', async () => {
            prismaMock.order.count.mockResolvedValue(1);
            prismaMock.order.findMany.mockResolvedValue([orderMinMock]);
            const result = await service.findAll();
            expect(result).toEqual(pageResponse);
            expect(prismaMock.order.count).toHaveBeenCalled();
            expect(prismaMock.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
                skip: 0,
                take: 10,
                orderBy: { id: 'asc' }
            }));
        });
    });

    describe('findById', () => {
        it('should return an order by id', async () => {
            prismaMock.order.findUnique.mockResolvedValue(orderDetailsMock);
            const result = await service.findById(existingId, userMock);
            expect(result).toEqual(orderDetailsResponseMock);
            expect(prismaMock.order.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: existingId },
            }));
        });
        it('should throw NotFoundException if order does not exist', async () => {
            prismaMock.order.findUnique.mockResolvedValue(null);
            await expect(service.findById(nonExistingId, userMock)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create and return a new order', async () => {
            productServiceMock.findById.mockResolvedValue(PRODUCT_RESPONSE_MOCK);
            prismaMock.order.create.mockResolvedValue(orderDetailsMock);
            const result = await service.create(orderRequestMock, userMock);
            expect(result).toEqual(orderDetailsResponseMock);
            expect(productServiceMock.findById).toHaveBeenCalledWith(orderRequestMock.items[0].productId);
        });
        it('should throw NotFoundException if a product does not exist', async () => {
            productServiceMock.findById = jest.fn(() => {
                return Promise.reject(new NotFoundException('Product not found'));
            })
            await expect(service.create(orderRequestMock, userMock)).rejects.toThrow(NotFoundException);
        });
    });

})