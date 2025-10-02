import { LoginRequestDto } from "../../src/auth/dto/auth/login-request.dto";
import { RegisterRequestDto } from "../../src/auth/dto/auth/register-request.dto";

export const REGISTER_REQUEST_MOCK: RegisterRequestDto = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    password: '12345',
    cpf: '123.456.789-00',
    birthDate: new Date('1990-01-01')
}

export const LOGIN_REQUEST_MOCK: LoginRequestDto = {
    email: 'john.doe@example.com',
    password: '12345'
}