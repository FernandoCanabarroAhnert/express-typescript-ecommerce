import { IsString, IsNotEmpty } from "class-validator";

export class CreateCategoryDto {
    @IsString({ message: "Name must be a string" })
    @IsNotEmpty({ message: "Name must not be empty" })
    name: string;
    @IsString({ message: "Description must be a string" })
    @IsNotEmpty({ message: "Description must not be empty" })
    description: string;
    constructor(partial: Partial<CreateCategoryDto>) {
        Object.assign(this, partial);
    }
}