export class PageResponseDto<T> {
    data: T[];
    totalItems: number;
    numberOfItems: number;
    currentPage: number;
    totalPages: number;
    constructor(partial: Partial<PageResponseDto<T>>) {
        Object.assign(this, partial);
    }
}