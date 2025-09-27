import { NextFunction, Request, Response } from "express"

export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        return fn(req, res, next).catch((error: any) => next(error));
    }
}