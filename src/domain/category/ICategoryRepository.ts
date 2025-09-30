import { IGenericRepository } from '../common/IGenericRepository'
import { Category } from './Category'

export interface ICategoryRepository extends IGenericRepository<Category> {
    findBySlug(slug: string): Promise<Category | null>;
}