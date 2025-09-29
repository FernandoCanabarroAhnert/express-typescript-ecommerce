import { Request } from "express";
import { PaginationParamsDto } from "../dto/page/pagination-params.dto";
import { plainToClass } from "class-transformer";

export function obtainPaginationParams(req: Request): PaginationParamsDto {
    const paginationParams: PaginationParamsDto = plainToClass(PaginationParamsDto, req.query);
    if (isNaN(paginationParams.page)) {
        paginationParams.page = 1;
    }
    if (isNaN(paginationParams.size)) {
        paginationParams.size = 10;
    }
    return paginationParams;
}