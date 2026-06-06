import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from '../auth/current-user.decorator';
import { PaymentsService } from './payments.service';
import { InitiateDepositDto } from './dto/payment.dto';
export declare class PaymentsController {
    private payments;
    constructor(payments: PaymentsService);
    packs(): {};
    providers(): {
        provider: string;
        source: "mock" | "live";
        providers: {};
    };
    deposit(user: AuthUser, dto: InitiateDepositDto): unknown;
    callback(req: RawBodyRequest<Request>, body: Record<string, unknown>, signature?: string, timestamp?: string): unknown;
    status(user: AuthUser, depositId: string): unknown;
}
