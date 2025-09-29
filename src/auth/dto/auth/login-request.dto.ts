import { IsString, IsNotEmpty, IsEmail } from "class-validator";

export class LoginRequestDto {
    @IsString({ message: "Email must be a string" })
    @IsNotEmpty({ message: "Email must not be empty" })
    @IsEmail({}, { message: "Email must be a valid email address" })
    email: string;
    @IsString({ message: "Password must be a string" })
    @IsNotEmpty({ message: "Password must not be empty" })
    password: string;
}