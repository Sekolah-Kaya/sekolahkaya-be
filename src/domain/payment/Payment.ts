import { TransactionStatus } from "../common/enum";
import { Money } from "../common/ValueObject";

export class Payment {
    private constructor(
        private readonly _id: string,
        private readonly _enrollmentId: string,
        private readonly _grossAmount: Money,
        private readonly _orderId: string,
        private _transactionId: string | null,
        private _transactionStatus: TransactionStatus,
        private _paymentType: string | null,
        private _fraudStatus: string | null,
        private _midtransResponse: any,
        private _snapToken: string | null,
        private _transactionTime: Date | null,
        private _settlementTime: Date | null,
        private readonly _createdAt: Date,
        private _updatedAt: Date
    ) {}

    public static create(data: {
        enrollmentId: string;
        grossAmount: number;
        orderId: string;
        snapToken?: string;
    }): Payment {
        const id = crypto.randomUUID();
        const now = new Date();

        if (!data.orderId.trim()) {
            throw new Error('Order ID is required');
        }

        return new Payment(
            id,
            data.enrollmentId,
            Money.create(data.grossAmount),
            data.orderId.trim(),
            null,
            TransactionStatus.PENDING,
            null,
            null,
            null,
            data.snapToken || null,
            null,
            null,
            now,
            now
        );
    }

    public static reconstitute(data: {
        id: string;
        enrollmentId: string;
        grossAmount: number;
        orderId: string;
        transactionId: string | null;
        transactionStatus: TransactionStatus;
        paymentType: string | null;
        fraudStatus: string | null;
        midtransResponse: any;
        snapToken: string | null;
        transactionTime: Date | null;
        settlementTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }): Payment {
        return new Payment(
            data.id,
            data.enrollmentId,
            Money.create(data.grossAmount),
            data.orderId,
            data.transactionId,
            data.transactionStatus,
            data.paymentType,
            data.fraudStatus,
            data.midtransResponse,
            data.snapToken,
            data.transactionTime,
            data.settlementTime,
            data.createdAt,
            data.updatedAt
        );
    }

    // Getters
    public get id(): string { return this._id; }
    public get enrollmentId(): string { return this._enrollmentId; }
    public get grossAmount(): Money { return this._grossAmount; }
    public get orderId(): string { return this._orderId; }
    public get transactionId(): string | null { return this._transactionId; }
    public get transactionStatus(): TransactionStatus { return this._transactionStatus; }
    public get paymentType(): string | null { return this._paymentType; }
    public get fraudStatus(): string | null { return this._fraudStatus; }
    public get midtransResponse(): any { return this._midtransResponse; }
    public get snapToken(): string | null { return this._snapToken; }
    public get transactionTime(): Date | null { return this._transactionTime; }
    public get settlementTime(): Date | null { return this._settlementTime; }
    public get createdAt(): Date { return this._createdAt; }
    public get updatedAt(): Date { return this._updatedAt; }

    // Business methods
    public isPending(): boolean {
        return this._transactionStatus === TransactionStatus.PENDING;
    }

    public isSettled(): boolean {
        return this._transactionStatus === TransactionStatus.SETTLEMENT;
    }

    public isFailed(): boolean {
        return [
            TransactionStatus.CANCEL,
            TransactionStatus.DENY,
            TransactionStatus.EXPIRE,
            TransactionStatus.FAILURE
        ].includes(this._transactionStatus);
    }

    public isSuccessful(): boolean {
        return this.isSettled();
    }

    public updateFromMidtrans(response: {
        transactionId?: string;
        transactionStatus: TransactionStatus;
        paymentType?: string;
        fraudStatus?: string;
        transactionTime?: Date;
        settlementTime?: Date;
        midtransResponse: any;
    }): void {
        if (response.transactionId) {
            this._transactionId = response.transactionId;
        }
        
        this._transactionStatus = response.transactionStatus;
        
        if (response.paymentType) {
            this._paymentType = response.paymentType;
        }
        
        if (response.fraudStatus) {
            this._fraudStatus = response.fraudStatus;
        }
        
        if (response.transactionTime) {
            this._transactionTime = response.transactionTime;
        }
        
        if (response.settlementTime) {
            this._settlementTime = response.settlementTime;
        }
        
        this._midtransResponse = response.midtransResponse;
        this._updatedAt = new Date();
    }

    public cancel(): void {
        if (this._transactionStatus !== TransactionStatus.PENDING) {
            throw new Error('Only pending payments can be cancelled');
        }
        
        this._transactionStatus = TransactionStatus.CANCEL;
        this._updatedAt = new Date();
    }

    public canBeRefunded(): boolean {
        return this.isSettled();
    }
}