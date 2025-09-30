import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../exceptions/bad-request.exception";
import { logger } from "../config/winston.config";

export function handleError(err: any, req: Request, res: Response, next: NextFunction) {
    logger.error(err.stack);
    if (err instanceof BadRequestException && err.validationErrors) {
        return sendValidationError(err, req, res);
    }
    return sendDefaultError(err, req, res);
}

const sendValidationError = (err: any, req: Request, res: Response) => {
    const body = {
        timestamp: new Date().toISOString(),
        status: err.status,
        error: err.error,
        message: err.message,
        validationErrors: err.validationErrors,
        path: req.originalUrl
    }
    logger.error(JSON.stringify(body))
    return res.status(err.status).json(body);
}

const sendDefaultError = (err: any, req: Request, res: Response) => {
    const status = err.status || 500;
    const error = err.error || "Internal Server Error";
    const message = err.message || "Something went wrong";
    const body = {
        timestamp: new Date().toISOString(),
        status,
        error,
        message,
        path: req.originalUrl
    }
    logger.error(JSON.stringify(body))
    return res.status(status).json(body);
}