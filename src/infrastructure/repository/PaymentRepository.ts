import { PrismaClient } from "@prisma/client";
import { Payment } from "../../domain/models/Payment";
import { IGenericRepository } from "../../shared/interface/IGenericRepository";

export interface IPaymentRepository extends IGenericRepository<Payment> {
    findByOrderId(orderId: string): Promise<Payment | null>;
    findByEnrollmentId(enrollmentId: string): Promise<Payment | null>;
}

export class PaymentRepository implements IPaymentRepository {
    public constructor(readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Payment | null> {
        const data = await this.prisma.payment.findUnique({
            where: { id }
        })

        return data ? this.toDomain(data) : null
    }

    async findByOrderId(orderId: string): Promise<Payment | null> {
        const data = await this.prisma.payment.findUnique({
            where: { orderId }
        })

        return data ? this.toDomain(data) : null
    }

    async findByEnrollmentId(enrollmentId: string): Promise<Payment | null> {
        const data = await this.prisma.payment.findUnique({
            where: { enrollmentId }
        })

        return data ? this.toDomain(data) : null
    }

    async findAll(): Promise<Payment[]> {
        const payments = await this.prisma.payment.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return payments.map(payment => this.toDomain(payment))
    }

    async create(data: Payment): Promise<Payment> {
        const paymentData = await this.prisma.payment.create({
            data: {
                id: data.id,
                enrollmentId: data.enrollmentId,
                grossAmount: data.grossAmount.getValue(),
                orderId: data.orderId,
                transactionId: data.transactionId,
                transactionStatus: data.transactionStatus,
                paymentType: data.paymentType,
                fraudStatus: data.fraudStatus,
                midtransResponse: data.midtransResponse,
                snapToken: data.snapToken,
                transactionTime: data.transactionTime,
                settlementTime: data.settlementTime,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            }
        })

        return this.toDomain(paymentData)
    }

    async update(id: string, data: Partial<Payment>): Promise<Payment | null> {
        try {
            const paymentData = await this.prisma.payment.update({
                where: { id },
                data: {
                    transactionId: data.transactionId,
                    transactionStatus: data.transactionStatus,
                    paymentType: data.paymentType,
                    fraudStatus: data.fraudStatus,
                    midtransResponse: data.midtransResponse,
                    snapToken: data.snapToken,
                    transactionTime: data.transactionTime,
                    settlementTime: data.settlementTime,
                    updatedAt: new Date()
                }
            })

            return this.toDomain(paymentData)
        } catch {
            return null
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.payment.delete({
                where: { id }
            })
            return true
        } catch {
            return false
        }
    }

    private toDomain(paymentData: any): Payment {
        return Payment.reconstitute({
            id: paymentData.id,
            enrollmentId: paymentData.enrollmentId,
            grossAmount: Number(paymentData.grossAmount),
            orderId: paymentData.orderId,
            transactionId: paymentData.transactionId,
            transactionStatus: paymentData.transactionStatus,
            paymentType: paymentData.paymentType,
            fraudStatus: paymentData.fraudStatus,
            midtransResponse: paymentData.midtransResponse,
            snapToken: paymentData.snapToken,
            transactionTime: paymentData.transactionTime,
            settlementTime: paymentData.settlementTime,
            createdAt: paymentData.createdAt,
            updatedAt: paymentData.updatedAt
        })
    }
}
