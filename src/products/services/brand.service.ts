import { inject, injectable } from "tsyringe";
import { PRISMA_SERVICE } from "../../common/constants/services.constants";
import { CreateBrandDto } from "../dto/brand/create-brand.dto";
import { UpdateBrandDto } from "../dto/brand/update-brand.dto";
import { PrismaClient } from "@prisma/client";
import { BrandResponseDto } from "../dto/brand/brand-response.dto";
import { BrandMapper } from "../../common/mappers/brand.mapper";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { BrandType } from "../types/brand.type";

@injectable()
export class BrandService {

    constructor(
        @inject(PRISMA_SERVICE)
        private readonly prisma: PrismaClient
    ) {}

    async findAll(): Promise<BrandResponseDto[]> {
        return (await this.prisma.brand.findMany()).map(BrandMapper.mapBrandResponse);
    }

    async findById(id: number): Promise<BrandResponseDto> {
        return BrandMapper.mapBrandResponse(await this.findBrandById(id));
    }

    async create(createBrandDto: CreateBrandDto): Promise<BrandResponseDto> {
        const brand = await this.prisma.brand.create({
            data: {
                ...createBrandDto
            }
        });
        return BrandMapper.mapBrandResponse(brand);
    }

    async update(id: number, updateBrandDto: UpdateBrandDto): Promise<BrandResponseDto> {
        await this.findBrandById(id);
        const brand = await this.prisma.brand.update({
            where: { id },
            data: {
                ...updateBrandDto
            }
        });
        return BrandMapper.mapBrandResponse(brand);
    }

    async delete(id: number): Promise<void> {
        await this.findBrandById(id);
        await this.prisma.brand.delete({
            where: { id }
        })
    }

    private async findBrandById(id: number): Promise<BrandType> {
        const brand = await this.prisma.brand.findUnique({
            where: { id }
        });
        if (!brand) {
            throw new NotFoundException(`Brand with id ${id} not found`)
        }
        return brand;
    }

}