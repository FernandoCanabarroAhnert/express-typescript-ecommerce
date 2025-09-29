import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import { RolesEnum } from "../enums/roles.enum";
import { ForbiddenException } from "../exceptions/forbidden.exception";

export class PreAuthorizeMiddleware {

    execute = (...roles: RolesEnum[]) => {
        return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
            const user = req.user!;
            const hasRole = roles.some(role => user.roles.map(r => r.role.authority).includes(role));
            if (!hasRole) {
                throw new ForbiddenException("You do not have permission to access this resource");
            }
            next();
        });
    }

}