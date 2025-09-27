import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateProductDto {
    @IsString({ message: "Name must be a string" })
    @IsNotEmpty({ message: "Name must not be empty" })
    name: string;
    @IsNumber({}, { message: "Price must be a number" })
    @IsPositive({ message: "Price must be a positive number" })
    @IsNotEmpty({ message: "Price must not be empty" })
    price: number;
    @IsString({ message: "Description must be a string" })
    @IsNotEmpty({ message: "Description must not be empty" })
    description: string;
    @IsNumber({}, { message: "Brand ID must be a number" })
    @IsNotEmpty({ message: "Brand ID must not be empty" })
    brandId: number;
    @IsArray({ message: "Categories must be an array of numbers" })
    @ArrayNotEmpty({ message: "Categories must not be empty" })
    @IsNumber({}, { each: true, message: "Each category ID must be a number" })
    categoriesIds: number[];

    constructor(partial: Partial<CreateProductDto>) {
        Object.assign(this, partial);
    }
}
