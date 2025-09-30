export interface CreatePaymentCommand {
    enrollmentId: string;
    amount: number;
}

export interface ProcessPaymentWebhookCommand {
    orderId: string;
    transactionStatus: string;
    transactionId?: string;
    paymentType?: string;
    fraudStatus?: string;
    transactionTime?: string;
    settlementTime?: string;
    signatureKey: string;
    rawResponse: any;
}
