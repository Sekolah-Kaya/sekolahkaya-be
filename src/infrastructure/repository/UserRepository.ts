import { PrismaClient } from "@prisma/client"
import { User } from "../../domain/models/User"
import { IGenericRepository } from "../../shared/interface/IGenericRepository"

export interface IUserRepository extends IGenericRepository<User> {
    findByEmail(email: string): Promise<User | null>
}

export class UserRepository implements IUserRepository {
    constructor(readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<User | null> {
        const userData = await this.prisma.user.findUnique({
            where: { id }
        })

        return userData ? this.toDomain(userData) : null
    }

    async findByEmail(email: string): Promise<User | null> {
        const userData = await this.prisma.user.findUnique({
            where: { email }
        })

        return userData ? this.toDomain(userData) : null
    }

    async findAll(): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return users.map(user => this.toDomain(user))
    }

    async create(user: User): Promise<User> {
        const userData = await this.prisma.user.create({
            data: {
                id: user.id,
                email: user.email.getValue(),
                passwordHash: user.passwordHash,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                profilePicture: user.profilePicture,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        })

        return this.toDomain(userData)
    }

    async update(id: string, data: Partial<User>): Promise<User | null> {
        const updateData: any = {}

        if (data.email) updateData.email = data.email.getValue();
        if (data.firstName !== undefined) updateData.firstName = data.firstName;
        if (data.lastName !== undefined) updateData.lastName = data.lastName;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;

        const userData = await this.prisma.user.update({
            where: { id },
            data: updateData
        })

        return this.toDomain(userData)
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.user.delete({
                where: { id }
            })
            return true
        } catch {
            return false
        }
    }

    private toDomain(userData: any): User {
        return User.reconstitute({
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            role: userData.role,
            profilePicture: userData.profilePicture,
            isActive: userData.isActive,
            passwordHash: userData.passwordHash,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
        })
    }
}