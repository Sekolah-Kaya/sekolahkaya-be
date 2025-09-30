export interface IGenericRepository<T, ID = string> {
    findById(id: ID): Promise<T | null>
    findAll(): Promise<T[]>
    create(data: Partial<T>): Promise<T>
    update(id: ID, data: Partial<T>): Promise<T | null>
    delete(id: ID): Promise<boolean>
}