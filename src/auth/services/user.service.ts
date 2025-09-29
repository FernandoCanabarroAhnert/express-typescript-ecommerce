import { PrismaClient } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { PRISMA_SERVICE } from "../../common/constants/services.constants";
import { CreateUserDto } from "../dto/user/create-user.dto";
import { UserType } from "../types/user.type";

@injectable()
export class UserService {

    private readonly includeQuery = {
        roles: {
            select: {
                role: {
                    select: {
                        id: true,
                        authority: true
                    }
                }
            }
        }
    }

    constructor(
        @inject(PRISMA_SERVICE)
        private readonly prisma: PrismaClient
    ) { }

    async findByEmail(email: string) {
        return await this.prisma.user.findFirst({
            where: { email },
            include: this.includeQuery
        });
    }

    async create(createUserDto: CreateUserDto): Promise<UserType> {
        return await this.prisma.user.create({
            data: {
                ...createUserDto,
                roles: {
                    create: createUserDto.roles.map(roleId => ({
                        role: {
                            connect: {
                                id: roleId
                            }
                        }
                    }))
                }
            },
            include: this.includeQuery
        })
    }

}