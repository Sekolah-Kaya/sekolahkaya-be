import { IEmailService } from "../../application/EmailService";
import nodemailer from 'nodemailer'
import { User } from "../../domain/user/User";
import { Course } from "../../domain/course/Course";

export class NodeMailerEmailService implements IEmailService {
    private transporter: nodemailer.Transporter

    constructor(readonly config: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
        from: string;
    }) {
        this.transporter = nodemailer.createTransport(config)
    }

    async sendWelcomeEmail(user: User): Promise<void> {
        const mailOptions = {
            from: this.config.from,
            to: user.email.getValue(),
            subject: 'Selamat Datang Di Sekolah Kaya',
            html: `
                <h1>Welcome ${user.firstName}!</h1>
                <p>Thank you for joining our learning platform. We're excited to have you!</p>
                <p>You can now start exploring courses and begin your learning journey.</p>
            `
        }

        await this.transporter.sendMail(mailOptions)
    }

    async sendEnrollmentConfirmation(user: User, course: Course): Promise<void> {
        const mailOptions = {
            from: this.config.from,
            to: user.email.getValue(),
            subject: `Enrollment Confirmed: ${course.title}`,
            html: `
                <h1>Enrollment Confirmed!</h1>
                <p>Hi ${user.firstName},</p>
                <p>You have successfully enrolled in <strong>${course.title}</strong>.</p>
                <p>You can now access the course content and start learning!</p>
            `
        }

        await this.transporter.sendMail(mailOptions)
    }

    async sendPasswordChangeNotification(user: User): Promise<void> {
        const mailOptions = {
            from: this.config.from,
            to: user.email.getValue(),
            subject: `Password changed successfully`,
            html: `
                <h1>Password Changed</h1>
                <p>Hi ${user.firstName},</p>
                <p>Your password has been successfully changed.</p>
                <p>If you didn't make this change, please contact support immediately.</p>
            `
        }

        await this.transporter.sendMail(mailOptions)
    }
}