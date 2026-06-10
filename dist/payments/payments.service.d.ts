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
    packs(): import("./credit-packs").CreditPack[];
    providers(): {
        provider: string;
        source: "mock" | "live";
        providers: import("./payment-providers").PaymentOperator[];
    };
    initiate(userId: string, dto: InitiateDepositDto): Promise<{
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
    handleWebhook(body: Record<string, unknown>, opts: {
        rawBody?: string;
        signature?: string;
        timestamp?: string;
    }): Promise<{
        ok: boolean;
    } | string>;
    verifyWebhook(signature?: string, timestamp?: string, rawBody?: string): void;
    handleCallback(body: Record<string, unknown>): Promise<{
        ok: boolean;
    }>;
    handleMonetbilCallback(params: Record<string, unknown>): Promise<string>;
    private verifyMonetbilNotification;
    private normalizeStatus;
    checkAndSync(userId: string, depositId: string): Promise<{
        depositId: string;
        status: string | undefined;
        credited: boolean;
    }>;
    createManual(userId: string, packId: string, senderPhone: string, txId: string): Promise<{
        depositId: `${string}-${string}-${string}-${string}-${string}`;
        status: string;
        message: string;
    }>;
    adminApprove(paymentId: string): Promise<{
        id: string;
        depositId: string;
        providerRef: string | null;
        userId: string;
        amount: string;
        currency: string;
        provider: string | null;
        phoneNumber: string;
        creditsPack: number;
        status: string;
        failureReason: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    adminReject(paymentId: string, reason?: string): Promise<{
        id: string;
        depositId: string;
        providerRef: string | null;
        userId: string;
        amount: string;
        currency: string;
        provider: string | null;
        phoneNumber: string;
        creditsPack: number;
        status: string;
        failureReason: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    private applyFinalStatus;
}
