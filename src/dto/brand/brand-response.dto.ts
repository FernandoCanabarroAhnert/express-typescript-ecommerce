export class BrandResponseDto {
    id: number;
    name: string;
    description: string;
    constructor(partial: Partial<BrandResponseDto>) {
        Object.assign(this, partial);
    }
}