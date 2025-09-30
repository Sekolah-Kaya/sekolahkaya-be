import { ApplicationResult } from "../common/ResultObject";
import { User } from "./User";
import { ChangePasswordCommand, RegisterUserCommand, UpdateUserProfileCommand } from "./UserDTO";

export interface IUserApplicationService {
    registerUser(command: RegisterUserCommand): Promise<ApplicationResult<User>>;
    updateProfile(command: UpdateUserProfileCommand): Promise<ApplicationResult<User>>;
    changePassword(command: ChangePasswordCommand): Promise<ApplicationResult<boolean>>;
    getUserById(id: string): Promise<ApplicationResult<User>>;
    deactivateUser(userId: string): Promise<ApplicationResult<boolean>>;
    activateUser(userId: string): Promise<ApplicationResult<boolean>>;
}
