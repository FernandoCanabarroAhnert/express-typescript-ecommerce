import { UserResponseDto } from "../../src/auth/dto/user/user-response.dto";
import { UserType } from "../../src/auth/types/user.type";
import { RolesEnum } from '../../src/common/enums/roles.enum'
import { UserMapper } from "../../src/common/mappers/user.mapper";

export const USER_MOCK: UserType = {
    id: 1,
    email: 'john.doe@example.com',
    password: '12345',
    fullName: 'John Doe',
    cpf: '123.456.789-00',
    birthDate: new Date('1990-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [
        {
            role: {
                id: 1,
                authority: RolesEnum.USER
            }
        }
    ]
}

export const USER_RESPONSE_MOCK: UserResponseDto = UserMapper.mapUserResponse(USER_MOCK);