export type UserType = {
    id: number;
    email: string;
    password: string;
    fullName: string;
    cpf: string;
    birthDate: Date;
    createdAt: Date;
    updatedAt: Date;
    roles: {
        role: {
            id: number;
            authority: string;
        };
    }[]
}