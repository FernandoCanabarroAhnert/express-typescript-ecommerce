import { NextFunction, Request, Response } from "express";
import { logger } from "../config/winston.config";

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
    const logData = {
        method: req.method,
        url: req.url,
        ip: req.ip,
        headers: req.headers,
        cookies: req.cookies,
        query: req.query,
        params: req.params,
        body: req.body,
        statusCode: res.statusCode
    };
    logger.http(`Incoming request: ${JSON.stringify(logData, null, 2)}`);

    const startTime = Date.now();
    const originalSend = res.send;
    let responseBody: any;
    res.send = function (body: any) {
        responseBody = body;
        return originalSend.call(this, body);
    };
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            request: {
                headers: req.headers,
                cookies: req.cookies,
                query: req.query,
                params: req.params,
                body: req.body
            },
            response: {
                body: responseBody
            }
        };
        logger.http(`Request completed, ${JSON.stringify(logData, null, 2)}`);
    });
    next();
};