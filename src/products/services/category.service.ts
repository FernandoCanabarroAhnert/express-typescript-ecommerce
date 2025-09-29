import { inject, injectable } from "tsyringe";
import { PRISMA_SERVICE } from "../../common/constants/services.constants";
import { CreateCategoryDto } from "../dto/category/create-category.dto";
import { UpdateCategoryDto } from "../dto/category/update-category.dto";
import { PrismaClient } from "@prisma/client";

@injectable()
export class CategoryService {

    constructor(
        @inject(PRISMA_SERVICE)
        private readonly prisma: PrismaClient
    ) {}

    async findAll() {
        return await this.prisma.category.findMany();
    }

    async findById(id: number) {
        return await this.prisma.category.findUnique({
            where: { id }
        });
    }

    async create(createCategoryDto: CreateCategoryDto) {
        return await this.prisma.category.create({
            data: {
                ...createCategoryDto
            }
        });
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto) {
        return await this.prisma.category.update({
            where: { id },
            data: {
                ...updateCategoryDto
            }
        });
    }

    async delete(id: number) {
        return await this.prisma.category.delete({
            where: { id }
        });
    }

}