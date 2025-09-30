import { Payment } from "../domain/payment/Payment";

export interface IPaymentService {
    createPayment(data: { enrollmentId: string; amount: number }): Promise<Payment>;
}
