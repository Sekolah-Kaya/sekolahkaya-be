import { Role } from "../domain/common/enum"

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string,
                email: string,
                role: Role,
                firstName: string,
                lastName: string,
                jti?: string
            }
        }
    }
}