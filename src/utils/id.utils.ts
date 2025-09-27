import { Request } from "express";
import { ErrorResponseDto } from "../exceptions/error-response.dto";

export function obtainAndValidateId(req: Request): number {
    const id = +req.params.id;
    if (isNaN(id)) {
        throw new ErrorResponseDto(400, "Bad Request", "Invalid ID format");
    }
    return id;
}