import { PrismaClient } from "@prisma/client";
import { ICategoryRepository } from "../../../domain/category/ICategoryRepository";
import { Category } from "../../../domain/category/Category";

export class CategoryRepository implements ICategoryRepository {
    public constructor(readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Category | null> {
        const data = await this.prisma.category.findUnique({
            where: { id }
        })

        return data ? this.toDomain(data) : null
    }

    async findBySlug(slug: string): Promise<Category | null> {
        const data = await this.prisma.category.findUnique({
            where: { slug }
        })

        return data ? this.toDomain(data) : null
    }

    async findAll(): Promise<Category[]> {
        const categories = await this.prisma.category.findMany({
            orderBy: { name: 'desc' }
        })

        return categories.map(category => this.toDomain(category))
    }

    async create(data: Category): Promise<Category> {
        const categoryData = await this.prisma.category.create({
            data: {
                name: data.name,
                description: data.description,
                slug: data.slug,
            }
        })

        return this.toDomain(categoryData)
    }

    async update(id: string, data: Partial<Category>): Promise<Category | null> {
        const categoryData = await this.prisma.category.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                slug: data.slug
            }
        })

        return this.toDomain(categoryData)
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.category.delete({
                where: { id }
            })

            return true
        } catch (error) {
            return false
        }
    }

    private toDomain(categoryData: any): Category {
        return Category.reconstitute({
            id: categoryData.id,
            name: categoryData.name,
            description: categoryData.description,
            slug: categoryData.slug,
            createdAt: categoryData.createdAt,
            updatedAt: categoryData.updatedAt
        })
    }
}