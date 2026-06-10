import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from '../auth/current-user.decorator';
import { PaymentsService } from './payments.service';
import { InitiateDepositDto } from './dto/payment.dto';
export declare class PaymentsController {
    private payments;
    constructor(payments: PaymentsService);
    packs(): import("./credit-packs").CreditPack[];
    providers(): {
        provider: string;
        source: "mock" | "live";
        providers: import("./payment-providers").PaymentOperator[];
    };
    deposit(user: AuthUser, dto: InitiateDepositDto): Promise<{
        depositId: `${string}-${string}-${string}-${string}-${string}`;
        status: string;
        checkoutUrl: string | undefined;
        ussdCode: string | undefined;
        operator: string | undefined;
        pack: {
            id: string;
            credits: number;
            amount: string;
            currency: string;
        };
        message: string;
    }>;
    callback(req: RawBodyRequest<Request>, body: Record<string, unknown>, signature?: string, timestamp?: string): Promise<string | {
        ok: boolean;
    }>;
    status(user: AuthUser, depositId: string): Promise<{
        depositId: string;
        status: string | undefined;
        credited: boolean;
    }>;
}
