import { User } from "../../domain/models/User";
import { IUserRepository } from "../../infrastructure/repository/UserRepository";
import { IEmailService } from "../../shared/interface/IEmailService";
import { IEventDispatcher } from "../../shared/interface/IEventDispatcher";
import { IPasswordService } from "../../shared/interface/IPasswordService";
import { ApplicationResult } from "../../shared/types/ApplicationResult";
import { ChangePasswordCommand } from "../commands/user/ChangePasswordCommand";
import { RegisterUserCommand } from "../commands/user/RegisterUserCommand";
import { UpdateUserProfileCommand } from "../commands/user/UpdateUserProfileCommand";

export interface IUserApplicationService {
    registerUser(command: RegisterUserCommand): Promise<ApplicationResult<User>>;
    updateProfile(command: UpdateUserProfileCommand): Promise<ApplicationResult<User>>;
    changePassword(command: ChangePasswordCommand): Promise<ApplicationResult<boolean>>;
    getUserById(id: string): Promise<ApplicationResult<User>>;
    deactivateUser(userId: string): Promise<ApplicationResult<boolean>>;
    activateUser(userId: string): Promise<ApplicationResult<boolean>>;
}

export class UserApplicationService implements IUserApplicationService {
    public constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordService: IPasswordService,
        private readonly emailService: IEmailService,
        private readonly eventDispatcher: IEventDispatcher,
    ) {}

    async registerUser(command: RegisterUserCommand): Promise<ApplicationResult<User>> {
        try {
            const existingUser = await this.userRepository.findByEmail(command.email)
            if (existingUser) {
                return {
                    success: false,
                    error: "Email already registered"
                }
            }

            const passwordHash = await this.passwordService.hash(command.password)

            const user = User.create({
                email: command.email,
                firstName: command.firstName,
                lastName: command.lastName,
                phone: command.phone,
                role: command.role,
                passwordHash
            })

            const savedUser = await this.userRepository.create(user)

            const events = user.getDomainEvents()
            for (const event of events) {
                await this.eventDispatcher.dispatch(event)
            }
            user.clearDomainEvents()

            await this.emailService.sendWelcomeEmail(savedUser)

            return {
                success: true,
                data: savedUser
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred'
            }
        }
    }

    async updateProfile(command: UpdateUserProfileCommand): Promise<ApplicationResult<User>> {
        try {
            const user = await this.userRepository.findById(command.userId)
            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                }
            }

            user.updateProfile({
                firstName: command.firstName,
                lastName: command.lastName,
                phone: command.phone,
                profilePicture: command.profilePicture,
            })

            const updatedUser = await this.userRepository.update(user.id, user)

            return {
                success: true,
                data: updatedUser!
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Update failed'
            }
        }
    }

    async changePassword(command: ChangePasswordCommand): Promise<ApplicationResult<boolean>> {
        try {
            const user = await this.userRepository.findById(command.userId)
            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                }
            }

            const isValidPassword = await this.passwordService.verify(
                command.currentPassword,
                user.passwordHash
            )

            if (!isValidPassword) {
                return {
                    success: false,
                    error: 'Current password is incorrect'
                }
            }

            const newPasswordHash = await this.passwordService.hash(command.newPassword)

            await this.userRepository.update(user.id, {passwordHash: newPasswordHash})

            await this.emailService.sendPasswordChangeNotification(user)

            return {
                success: true,
                data: true
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Password change failed'
            };
        }
    }

    async getUserById(id: string): Promise<ApplicationResult<User>> {
        try {
            const user = await this.userRepository.findById(id)
            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                }
            }

            return {
                success: true,
                data: user
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get user'
            }
        }
    }

    async deactivateUser(userId: string): Promise<ApplicationResult<boolean>> {
        try {
            const user = await this.userRepository.findById(userId)
            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                }
            }

            user.deactivate()
            await this.userRepository.update(user.id, user)

            return {
                success: true,
                data: true
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Deactivation failed'
            };
        }
    }

    async activateUser(userId: string): Promise<ApplicationResult<boolean>> {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            user.activate();
            await this.userRepository.update(user.id, user);

            return {
                success: true,
                data: true
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Activation failed'
            };
        }
    }
}