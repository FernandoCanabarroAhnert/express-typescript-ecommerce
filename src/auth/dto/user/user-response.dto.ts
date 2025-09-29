import { RoleDto } from "../role/role.dto";

export class UserResponseDto {
    id: number;
    fullName: string;
    email: string;
    cpf: string;
    birthDate: Date;
    roles: RoleDto[];
    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}