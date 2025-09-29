import { inject, injectable } from "tsyringe";
import { PRISMA_SERVICE } from "../../common/constants/services.constants";
import { CreateBrandDto } from "../dto/brand/create-brand.dto";
import { UpdateBrandDto } from "../dto/brand/create-brand.dto copy";
import { PrismaClient } from "@prisma/client";

@injectable()
export class BrandService {

    constructor(
        @inject(PRISMA_SERVICE)
        private readonly prisma: PrismaClient
    ) {}

    async findAll() {
        return this.prisma.brand.findMany();
    }

    async findById(id: number) {
        return this.prisma.brand.findUnique({
            where: { id }
        });
    }

    async create(createBrandDto: CreateBrandDto) {
        return await this.prisma.brand.create({
            data: {
                ...createBrandDto
            }
        });
    }

    async update(id: number, updateBrandDto: UpdateBrandDto) {
        return await this.prisma.brand.update({
            where: { id },
            data: {
                ...updateBrandDto
            }
        })
    }

    async delete(id: number) {
        return await this.prisma.brand.delete({
            where: { id }
        })
    }

}