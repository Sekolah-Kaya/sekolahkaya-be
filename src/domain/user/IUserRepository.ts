import { IGenericRepository } from "../common/IGenericRepository";
import { User } from "./User";

export interface IUserRepository extends IGenericRepository<User> {
    findByEmail(email: string): Promise<User | null>
}
