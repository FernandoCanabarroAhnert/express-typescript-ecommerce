import { ClassConstructor, plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import { BadRequestException } from "../exceptions/bad-request.exception";

export function validateRequest(targetClass: ClassConstructor<any>, option: 'body' | 'query') {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const dto = plainToClass(targetClass, req[option]);
        const errors = await validate(dto);
        if (errors.length > 0) {
            const validationErrors: string[] = [];
            errors.forEach(err => {
                const errorMessages = Object.values(err.constraints || {});
                validationErrors.push(...errorMessages);
            });
            throw new BadRequestException("Validation failed", validationErrors);
        }
        next();
    })
}