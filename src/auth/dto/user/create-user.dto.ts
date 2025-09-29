import { ArrayNotEmpty, IsArray, IsDate, IsEmail, IsNotEmpty, IsNumber, IsString, Matches } from "class-validator";

export class CreateUserDto {
    @IsString({ message: "Name must be a string" })
    @IsNotEmpty({ message: "Name must not be empty" })
    fullName: string;
    @IsString({ message: "Email must be a string" })
    @IsNotEmpty({ message: "Email must not be empty" })
    @IsEmail({}, { message: "Email must be a valid email address" })
    email: string;
    @IsString({ message: "Password must be a string" })
    @IsNotEmpty({ message: "Password must not be empty" })
    password: string;
    @Matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/, { message: "CPF must be in the format XXX.XXX.XXX-XX" })
    @IsString({ message: "Password must be a string" })
    @IsNotEmpty({ message: "Password must not be empty" })
    cpf: string;
    @IsNotEmpty({ message: "Birth date must not be empty" })
    @IsDate({ message: "Birth date must be a valid date" })
    birthDate: Date;
    @IsArray({ message: "Roles must be an array of numbers" })
    @ArrayNotEmpty({ message: "Roles must not be empty" })
    @IsNumber({}, { each: true, message: "Each role ID must be a number" })
    roles: number[];
}