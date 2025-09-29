import { RoleDto } from "../../auth/dto/role/role.dto";
import { UserResponseDto } from "../../auth/dto/user/user-response.dto";
import { UserType } from "../../auth/types/user.type";

export class UserMapper {

    static mapUserResponse(user: UserType): UserResponseDto {
        return new UserResponseDto({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            cpf: user.cpf,
            birthDate: user.birthDate,
            roles: this.mapRoles(user.roles)
        })
    }

    private static mapRoles = (roles: UserType["roles"]): RoleDto[] => {
        return roles.map(role => new RoleDto(role.role));
    }

}