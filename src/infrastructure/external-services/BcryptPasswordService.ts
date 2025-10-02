import bcrypt from "bcryptjs";
import { IPasswordService } from "../../shared/interface/IPasswordService";

export class BcryptPasswordService implements IPasswordService {
    private readonly saltRounds = 12

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds)
    }

    async verify(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash)
    }
}