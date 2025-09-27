import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class UpdateCategoryDto {
    @IsOptional()
    @IsString({ message: "Name must be a string" })
    @IsNotEmpty({ message: "Name must not be empty" })
    name?: string;
    @IsOptional()
    @IsString({ message: "Description must be a string" })
    @IsNotEmpty({ message: "Description must not be empty" })
    description?: string;
    constructor(partial: Partial<UpdateCategoryDto>) {
        Object.assign(this, partial);
    }
}