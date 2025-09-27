import { NextFunction, Request, Response } from "express";

export function handleError(err: any, req: Request, res: Response, next: NextFunction) {
    console.log(err.stack);
    if (err.validationErrors) {
        return sendValidationError(err, req, res);
    }
    return sendDefaultError(err, req, res);
}

const sendValidationError = (err: any, req: Request, res: Response) => {
    return res.status(err.status).json({
        timestamp: new Date().toISOString(),
        status: err.status,
        error: err.error,
        message: err.message,
        validationErrors: err.validationErrors,
        path: req.originalUrl
    });
}

const sendDefaultError = (err: any, req: Request, res: Response) => {
    const status = err.status || 500;
    const error = err.error || "Internal Server Error";
    const message = err.message || "Something went wrong";
    return res.status(status).json({
        timestamp: new Date().toISOString(),
        status,
        error,
        message,
        path: req.originalUrl
    })
}