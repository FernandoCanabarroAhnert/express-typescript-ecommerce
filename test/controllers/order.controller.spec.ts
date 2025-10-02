import "reflect-metadata";

import { ORDER_DETAILS_RESPONSE_MOCK, ORDER_MIN_RESPONSE_MOCK, ORDER_REQUEST_MOCK } from "../mocks/orders.mocks";
import { OrderController } from "../../src/orders/controllers/order.controller";
import { USER_MOCK } from "../mocks/users.mocks";
import { container } from "tsyringe";
import { ORDER_SERVICE } from "../../src/common/constants/services.constants";
import { PageResponseDto } from "../../src/common/dto/page/page-response.dto";
import { OrderMinResponseDto } from "../../src/orders/dto/order-min-response.dto";
import { OrderDetailsResponseDto } from "../../src/orders/dto/order-details-response.dto";
import { NotFoundException } from "../../src/common/exceptions/not-found.exception";
import { ForbiddenException } from "../../src/common/exceptions/forbidden.exception";

describe('OrderController', () => {
    let controller: OrderController;

    const orderServiceMock = {
        findAll: jest.fn(),
        findById: jest.fn(),
        create: jest.fn()
    }

    const existingId = '1';
    const nonExistingId = '999';
    const reqMock = {
        params: {
            id: ''
        },
        body: {},
        query: {
            page: '1',
            size: '10',
            sort: 'name',
            order: 'asc'
        },
        user: USER_MOCK
    } as any;
    const resMock = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
    } as any;
    const nextMock = jest.fn();

    const forbiddenError = {
        status: 403,
        error: "Forbidden"
    }
    const notFoundError = {
        status: 404,
        error: "Not Found"
    }

    let orderDetailsResponseMock: OrderDetailsResponseDto;
    let orderMinResponseMock: OrderMinResponseDto;
    let pageResponse: PageResponseDto<OrderMinResponseDto>;

    beforeAll(() => {
        container.registerInstance(ORDER_SERVICE, orderServiceMock);

        controller = container.resolve(OrderController);
    });

    beforeEach(() => {
        orderDetailsResponseMock = ORDER_DETAILS_RESPONSE_MOCK;
        orderMinResponseMock = ORDER_MIN_RESPONSE_MOCK;
        pageResponse = {
            data: [orderMinResponseMock],
            currentPage: 1,
            totalPages: 1,
            numberOfItems: 1,
            totalItems: 1
        };
    });

    describe('findAll', () => {
        it('should return a page of orders', async () => {
            orderServiceMock.findAll.mockResolvedValue(pageResponse);
            await controller.findAll(reqMock, resMock, nextMock);
            expect(resMock.json).toHaveBeenCalledWith(pageResponse);
        });
    });

    describe('findById', () => {
        it('should return an order when id exists', async () => {
            reqMock.params.id = existingId;
            orderServiceMock.findById.mockResolvedValue(orderDetailsResponseMock);
            await controller.findById(reqMock, resMock, nextMock);
            expect(resMock.json).toHaveBeenCalledWith(orderDetailsResponseMock);
        });
        it('should call next with ForbiddenException when user is not allowed to access the order', async () => {
            reqMock.params.id = existingId;
            orderServiceMock.findById = jest.fn(() => {
                return Promise.reject(new ForbiddenException('User not allowed to access this order'));
            });
            await controller.findById(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(forbiddenError));
        });
        it('should call next with NotFoundException when id does not exist', async () => {
            reqMock.params.id = nonExistingId;
            orderServiceMock.findById = jest.fn(() => {
                return Promise.reject(new NotFoundException('Order not found'));
            });
            await controller.findById(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
    });

    describe('create', () => {
        it('should create and return the new order', async () => {
            reqMock.body = ORDER_REQUEST_MOCK;
            orderServiceMock.create.mockResolvedValue(orderDetailsResponseMock);
            await controller.createOrder(reqMock, resMock, nextMock);
            expect(resMock.status).toHaveBeenCalledWith(201);
            expect(resMock.json).toHaveBeenCalledWith(orderDetailsResponseMock);
        });
        it('should call next with NotFoundException when a product does not exist', async () => {
            reqMock.body = ORDER_REQUEST_MOCK;
            orderServiceMock.create = jest.fn(() => {
                return Promise.reject(new NotFoundException('Product not found'));
            });
            await controller.createOrder(reqMock, resMock, nextMock);
            expect(nextMock).toHaveBeenCalledWith(expect.objectContaining(notFoundError));
        });
    });

});