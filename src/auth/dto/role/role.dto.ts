export class RoleDto {
    id: number;
    authority: string;
    constructor(partial: Partial<RoleDto>) {
        Object.assign(this, partial);
    }
}