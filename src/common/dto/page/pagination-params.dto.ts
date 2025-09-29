import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class PaginationParamsDto {
    @IsNumber({}, { message: "Page must be a number" })
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @Min(1, { message: "Page must be at least 1" })
    page: number;
    @IsNumber({}, { message: "Size must be a number" })
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @Min(1, { message: "Size must be at least 1" })
    size: number;
    @IsString({ message: "Sort must be a string" })
    @IsOptional()
    sort: string;
    @IsEnum(["asc", "desc"], { message: "Order must be either 'asc' or 'desc'" })
    @IsOptional()
    order: "asc" | "desc";
}