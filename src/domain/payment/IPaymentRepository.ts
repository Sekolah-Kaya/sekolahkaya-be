import { IGenericRepository } from "../common/IGenericRepository";
import { Payment } from "./Payment";

export interface IPaymentRepository extends IGenericRepository<Payment> {
    findByOrderId(orderId: string): Promise<Payment | null>;
    findByEnrollmentId(enrollmentId: string): Promise<Payment | null>;
}