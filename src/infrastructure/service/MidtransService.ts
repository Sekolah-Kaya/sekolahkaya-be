import { IPaymentService } from "../../application/PaymentService"
import { TransactionStatus } from "../../domain/common/enum"
import { IPaymentRepository } from "../../domain/payment/IPaymentRepository"
import { Payment } from "../../domain/payment/Payment"

export interface MidtransConfig {
    serverKey: string
    clientKey: string
    isProduction: boolean
    snapUrl: string
    apiUrl: string
}

export class MidtransService implements IPaymentService {
    public constructor(
        readonly config: MidtransConfig,
        readonly paymentRepository: IPaymentRepository
    ) {}

    async createPayment(data: { enrollmentId: string; amount: number }): Promise<Payment | null> {
        const orderId = `ORDER-${data.enrollmentId}-${Date.now()}`

        const payment = Payment.create({
            enrollmentId: data.enrollmentId,
            grossAmount: data.amount,
            orderId
        })

        const savedPayment = await this.paymentRepository.create(payment)

        const snapToken = await this.createSnapToken({
            orderId,
            grossAmount: data.amount
        })

        savedPayment.updateFromMidtrans({
            transactionStatus: TransactionStatus.PENDING,
            midtransResponse: { snapToken },
        })

        return this.paymentRepository.update(savedPayment.id, savedPayment)
    }

    private async createSnapToken(order: {orderId: string; grossAmount: number}): Promise<string> {
        const parameter = {
            transaction_details: {
                order_id: order.orderId,
                gross_amount: order.grossAmount
            },
            credit_card: {
                secure: true
            }
        }

        const response = await fetch(`${this.config.snapUrl}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(this.config.serverKey + ':').toString('base64')}`
            },
            body: JSON.stringify(parameter)
        })

        const result: any = await response.json()
        return result.token
    }

    async processWebhook(payload: any): Promise<void> {
        const isValid = this.verifyWebhookSignature(payload)
        if (!isValid) {
            throw new Error('Invalid webhook signature')
        }

        const payment = await this.paymentRepository.findByOrderId(payload.order_id)
        if (!payment) {
            throw new Error('Payment not found')
        }

        payment.updateFromMidtrans({
            transactionId: payload.transaction_id,
            transactionStatus: this.mapTransactionStatus(payload.transaction_status),
            paymentType: payload.payment_type,
            fraudStatus: payload.fraud_status,
            transactionTime: payload.transaction_time ? new Date(payload.transaction_time) : undefined,
            settlementTime: payload.settlementTime ? new Date(payload.settlement_time) : undefined,
            midtransResponse: payload
        })

        await this.paymentRepository.update(payment.id, payment)
    }

    private verifyWebhookSignature(payload: any): boolean {
        return true
    }

    private mapTransactionStatus(status: string): TransactionStatus {
        const statusMap: Record<string, TransactionStatus> = {
            'capture': TransactionStatus.SETTLEMENT,
            'settlement': TransactionStatus.SETTLEMENT,
            'pending': TransactionStatus.PENDING,
            'deny': TransactionStatus.DENY,
            'cancel': TransactionStatus.CANCEL,
            'expire': TransactionStatus.EXPIRE,
            'failure': TransactionStatus.FAILURE
        }

        return statusMap[status] || TransactionStatus.PENDING
    }
}