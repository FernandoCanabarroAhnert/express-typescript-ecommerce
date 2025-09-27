export class CategoryResponseDto {
    id: number;
    name: string;
    description: string;
    constructor(partial: Partial<CategoryResponseDto>) {
        Object.assign(this, partial);
    }
}