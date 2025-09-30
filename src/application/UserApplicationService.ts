import { ApplicationResult } from "../domain/common/ResultObject";
import { IUserApplicationService } from "../domain/user/IUserApplicationService";
import { IUserRepository } from "../domain/user/IUserRepository";
import { User } from "../domain/user/User";
import { ChangePasswordCommand, RegisterUserCommand, UpdateUserProfileCommand } from "../domain/user/UserDTO";
import { IEmailService } from "./EmailService";
import { IEventDispatcher } from "./EventDispatcher";
import { IPasswordService } from "./PasswordService";

export class UserApplicationService implements IUserApplicationService {
    private constructor(
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