import { Payment } from "../../domain/models/Payment";

export interface IPaymentService {
    createPayment(data: { enrollmentId: string; amount: number }): Promise<Payment | null>;
}
