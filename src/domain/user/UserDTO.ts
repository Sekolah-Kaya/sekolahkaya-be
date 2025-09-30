import { Role } from "../common/enum";

export interface RegisterUserCommand {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: Role;
}

export interface UpdateUserProfileCommand {
    userId: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    profilePicture?: string;
}

export interface ChangePasswordCommand {
    userId: string;
    currentPassword: string;
    newPassword: string;
}
