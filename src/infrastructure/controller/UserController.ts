import { Request, Response } from 'express'
import { UserApplicationService } from "../../application/UserApplicationService";
import { Role } from "../../domain/common/enum";
import { ChangePasswordCommand, RegisterUserCommand, UpdateUserProfileCommand } from "../../domain/user/UserDTO";
import { RequestValidator, ValidationRule } from "../../middleware/ValidationRule";
import { BaseController } from "./BaseController";

export class UserController extends BaseController {
    public constructor(readonly userService: UserApplicationService) {
        super()
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const validationRules: ValidationRule[] = [
                {
                    field: 'email',
                    rules: [
                        {type: 'required'},
                        {type: 'email'},
                    ]
                },
                {
                    field: 'password',
                    rules: [
                        {type: 'required'},
                        {type: 'minLength', value: 6},
                    ]
                },
                {
                    field: 'firstName',
                    rules: [
                        {type: 'required'},
                        {type: 'maxLength', value: 50}
                    ]
                },
                {
                    field: 'lastName',
                    rules: [
                        {type: 'required'},
                        {type: 'maxLength', value: 50}
                    ]
                },
                {
                    field: 'role',
                    rules: [
                        {type: 'required'},
                        {type: 'enum', value: [Role.STUDENT, Role.INSTRUCTOR]}
                    ]
                }
            ]

            const validationErrors = RequestValidator.validate(req.body, validationRules)
            if (Object.keys(validationErrors).length > 0) {
                this.sendValidationError(res, validationErrors)
                return
            }

            const command: RegisterUserCommand = {
                email: req?.body?.email,
                password: req?.body?.password,
                firstName: req?.body?.firstName,
                lastName: req?.body?.lastName,
                phone: req?.body?.phone,
                role: req?.body?.role
            }

            const result = await this.userService.registerUser(command)

            if (result.success) {
                this.sendSuccess(res, {
                    id: result.data!.id,
                    email: result.data!.email.getValue(),
                    firstName: result.data!.firstName,
                    lastName: result.data!.lastName,
                    role: result.data!.role
                }, 'User registered successfully', 201)
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Registration failed', 500)
        }
    }

    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = this.getUserId(req)
            const result = await this.userService.getUserById(userId)

            if (result.success) {
                const user = result.data!
                this.sendSuccess(res, {
                    id: user.id,
                    email: user.email.getValue(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    role: user.phone,
                    profilePicture: user.profilePicture,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                })
            } else {
                this.sendNotFound(res, 'User')
            }
        } catch (error) {
            this.sendError(res, 'Failed to get profile', 500)
        }
    }

    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const validationRules: ValidationRule[] = [
                {
                    field: 'firstName',
                    rules: [{ type: 'maxLength', value: 50 }]
                },
                {
                    field: 'lastName',
                    rules: [{ type: 'maxLength', value: 50 }]
                }
            ];

            const validationErrors = RequestValidator.validate(req.body, validationRules)
            if (Object.keys(validationErrors).length > 0) {
                this.sendValidationError(res, validationErrors)
                return
            }

            const command: UpdateUserProfileCommand = {
                userId: this.getUserId(req),
                firstName: req?.body?.firstName,
                lastName: req?.body?.lastName,
                phone: req?.body?.phone,
                profilePicture: req?.body?.profilePicture
            };

            const result = await this.userService.updateProfile(command)
            if (result.success) {
                const user = result.data!
                this.sendSuccess(res, {
                    id: user.id,
                    email: user.email.getValue(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    profilePicture: user.profilePicture
                }, 'Profile updated successfully')
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Profile update failed', 500)
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const validationRules: ValidationRule[] = [
                {
                    field: 'currentPassword',
                    rules: [{ type: 'required' }]
                },
                {
                    field: 'newPassword',
                    rules: [
                        { type: 'required' },
                        { type: 'minLength', value: 6 }
                    ]
                }
            ]

            const validationErrors = RequestValidator.validate(req.body, validationRules)
            if (Object.keys(validationErrors).length > 0) {
                this.sendValidationError(res, validationErrors)
                return
            }

            const command: ChangePasswordCommand = {
                userId: this.getUserId(req),
                currentPassword: req.body?.currentPassword,
                newPassword: req.body?.newPassword
            };

            const result = await this.userService.changePassword(command)
            if (result.success) {
                this.sendSuccess(res, null, 'Password changed successfully')
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Change password failed', 500)
        }
    }
}