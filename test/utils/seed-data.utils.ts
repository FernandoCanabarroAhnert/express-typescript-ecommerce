import { PrismaClient } from "@prisma/client";
import { RolesEnum } from "../../src/common/enums/roles.enum";

export async function seedData(prisma: PrismaClient): Promise<void> {
    const category = await prisma.category.create({
        data: {
            name: 'Categoria Teste',
            description: 'Descrição da Categoria',
        }
    });
    const brand = await prisma.brand.create({
        data: {
            name: 'Marca Teste',
            description: 'Descrição da Marca',
        } 
    });
    await prisma.product.create({
        data: {
            name: 'Produto de Teste',
            description: 'Descrição',
            price: 123.45,
            brand: { connect: { id: brand.id } },
            categories: {
                create: [
                    { categoryId: category.id },
                ]
            }
        }
    });
    const adminRole = await prisma.role.create({
        data: {
            authority: RolesEnum.ADMIN
        }
    });
    const userRole = await prisma.role.create({
        data: {
            authority: RolesEnum.USER
        }
    });
    await prisma.user.create({
        data: {
            email: 'john.doe@example.com',
            password: '$2a$10$pQ9p96PlJcCjGZIwyfGs9O0NVq6t8mtS36Lfou5baeRjkTB49ZV5G',
            fullName: 'John Doe',
            cpf: '123.456.789-00',
            birthDate: new Date('1990-01-01'),
            roles: { 
                create: [
                    { roleId: adminRole.id },
                    { roleId: userRole.id }
                ]
            }
        }
    });
    await prisma.user.create({
        data: {
            email: 'maria.silva@example.com',
            password: '$2a$10$pQ9p96PlJcCjGZIwyfGs9O0NVq6t8mtS36Lfou5baeRjkTB49ZV5G',
            fullName: 'Maria Silva',
            cpf: '123.456.789-10',
            birthDate: new Date('1990-01-01'),
            roles: { 
                create: [
                    { roleId: userRole.id }
                ]
            }
        }
    });
    await prisma.order.create({
        data: {
            userId: 1,
            amount: 123.45,
            items: {
                create: {
                    productId: 1,
                    quantity: 1,
                    price: 123.45
                }
            }
        }
    });
}