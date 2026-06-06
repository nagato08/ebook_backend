import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import type { PaymentProvider } from './payment-provider.interface';
import { InitiateDepositDto } from './dto/payment.dto';
export declare class PaymentsService {
    private prisma;
    private credits;
    private provider;
    private readonly logger;
    constructor(prisma: PrismaService, credits: CreditsService, provider: PaymentProvider);
    packs(): {};
    providers(): {
        provider: string;
        source: "mock" | "live";
        providers: {};
    };
    initiate(userId: string, dto: InitiateDepositDto): unknown;
    verifyWebhook(signature?: string, timestamp?: string, rawBody?: string): void;
    handleCallback(body: Record<string, unknown>): unknown;
    private normalizeStatus;
    checkAndSync(userId: string, depositId: string): unknown;
    private applyFinalStatus;
}
