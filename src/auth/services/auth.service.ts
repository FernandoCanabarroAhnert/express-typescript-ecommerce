import { PrismaClient } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { PRISMA_SERVICE } from "../../common/constants/services.constants";
import { RegisterRequestDto } from "../dto/auth/register-request.dto";
import { UserType } from "../types/user.type";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";

@injectable()
export class AuthService {

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
    ) {}

    async register(registerRequestDto: RegisterRequestDto): Promise<UserType> {
        const userRole = await this.prisma.role.findFirst({
            where: {
                authority: 'ROLE_USER'
            }
        });
        return await this.prisma.user.create({
            data: {
                ...registerRequestDto,
                birthDate: new Date(registerRequestDto.birthDate),
                roles: {
                    create: {
                        role: {
                            connect: {
                                id: userRole!.id
                            }
                        }
                    }
                }
            },
            include: this.includeQuery
        })
    }

    isAdminOrResourceOwner(user: UserType, resourceUserId: number): void {
        if (user.roles.some(r => r.role.authority === 'ROLE_ADMIN')) {
            return;
        }
        if (user.id === resourceUserId) {
            return;
        }
        throw new ForbiddenException('You do not have permission to access this resource');
    }

}