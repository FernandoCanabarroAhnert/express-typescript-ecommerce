import { inject, injectable } from "tsyringe";
import { PRISMA_SERVICE } from "../../common/constants/services.constants";
import { CreateCategoryDto } from "../dto/category/create-category.dto";
import { UpdateCategoryDto } from "../dto/category/update-category.dto";
import { PrismaClient } from "@prisma/client";
import { CategoryType } from "../types/category.type";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { CategoryResponseDto } from "../dto/category/category-response.dto";
import { CategoryMapper } from "../../common/mappers/category.mapper";
import { PageResponseDto } from "../../common/dto/page/page-response.dto";

@injectable()
export class CategoryService {

    constructor(
        @inject(PRISMA_SERVICE)
        private readonly prisma: PrismaClient
    ) {}

    async findAll(page: number = 1, size: number = 10, sort: string = 'id', order: 'asc' | 'desc' = 'asc'): Promise<PageResponseDto<CategoryResponseDto>> {
        const totalItems = await this.prisma.category.count();
        const totalPages = Math.ceil(totalItems / size);
        const categories = await this.prisma.category.findMany({
            take: size,
            skip: (page - 1) * size,
            orderBy: {
                [sort]: order
            }
        }).then(results => results.map(CategoryMapper.mapCategoryResponse));
        const response = new PageResponseDto<CategoryResponseDto>({
            data: categories,
            currentPage: page,
            totalPages,
            numberOfItems: categories.length,
            totalItems
        });
        return response;
    }

    async findById(id: number): Promise<CategoryResponseDto> {
        return CategoryMapper.mapCategoryResponse(await this.findCategoryById(id));
    }

    async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
        const category = await this.prisma.category.create({
            data: {
                ...createCategoryDto
            }
        });
        return CategoryMapper.mapCategoryResponse(category);
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
        await this.findCategoryById(id);
        const category = await this.prisma.category.update({
            where: { id },
            data: {
                ...updateCategoryDto
            }
        });
        return CategoryMapper.mapCategoryResponse(category);
    }

    async delete(id: number): Promise<void> {
        await this.findCategoryById(id);
        await this.prisma.category.delete({
            where: { id }
        });
    }

    private async findCategoryById(id: number): Promise<CategoryType> {
        const category = await this.prisma.category.findUnique({
            where: { id }
        });
        if (!category) {
            throw new NotFoundException(`Category with id ${id} not found`)
        }
        return category;
    }

}