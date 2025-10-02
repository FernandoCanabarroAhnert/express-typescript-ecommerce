import { PrismaClient } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { PRISMA_SERVICE } from "../../common/constants/services.constants";
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

    async findByEmail(email: string): Promise<UserType | null> {
        return await this.prisma.user.findUnique({
            where: { email },
            include: this.includeQuery
        });
    }

    async findByCpf(cpf: string): Promise<UserType | null> {
        return await this.prisma.user.findUnique({
            where: { cpf },
            include: this.includeQuery
        });
    }

}