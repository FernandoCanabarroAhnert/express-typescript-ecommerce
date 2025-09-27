import { PrismaClient } from "@prisma/client";

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
}