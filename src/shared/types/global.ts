import { Role } from "./Enum"

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