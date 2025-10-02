import { Role } from "../../../shared/types/Enum";

export interface RegisterUserCommand {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: Role;
}