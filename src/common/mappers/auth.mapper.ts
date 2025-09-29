import { Request } from "express";
import { RegisterRequestDto } from "../../auth/dto/auth/register-request.dto";

export class AuthMapper {

    static mapRegisterRequest = (req: Request): RegisterRequestDto => {
        const { fullName, email, password, cpf, birthDate } = req.body;
        return new RegisterRequestDto({ fullName, email, password, cpf, birthDate });
    }

}