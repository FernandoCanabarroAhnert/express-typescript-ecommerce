import { Request } from "express";
import { BaseErrorException } from "../exceptions/base-error.exception";
import { BadRequestException } from "../exceptions/bad-request.exception";

export function obtainAndValidateId(req: Request): number {
    const id = +req.params.id;
    if (isNaN(id)) {
        throw new BadRequestException('The provided id is not a valid number');
    }
    return id;
}