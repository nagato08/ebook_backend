import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
export declare class AdminService {
    private prisma;
    private payments;
    constructor(prisma: PrismaService, payments: PaymentsService);
    stats(): Promise<{
        users: number;
        books: number;
        booksReady: number;
        payments: {
            pending: number;
            successful: number;
        };
        revenue: number;
        niches: number;
    }>;
    users(opts: {
        search?: string;
        skip?: number;
        take?: number;
    }): Promise<{
        total: number;
        skip: number;
        take: number;
        items: {
            id: string;
            createdAt: Date;
            name: string;
            email: string;
            credits: number;
            emailVerified: boolean;
            _count: {
                books: number;
                payments: number;
            };
        }[];
    }>;
    user(id: string): Promise<{
        user: {
            id: string;
            createdAt: Date;
            name: string;
            email: string;
            avatarUrl: string | null;
            credits: number;
            emailVerified: boolean;
        };
        books: {
            id: string;
            status: string;
            createdAt: Date;
            title: string;
            unlocked: boolean;
        }[];
        payments: {
            id: string;
            providerRef: string | null;
            amount: string;
            currency: string;
            provider: string | null;
            phoneNumber: string;
            creditsPack: number;
            status: string;
            createdAt: Date;
        }[];
        ledger: {
            id: string;
            createdAt: Date;
            reason: string;
            delta: number;
            balanceAfter: number;
        }[];
    }>;
    paymentsList(opts: {
        status?: string;
        provider?: string;
        take?: number;
    }): Promise<{
        id: string;
        providerRef: string | null;
        amount: string;
        currency: string;
        provider: string | null;
        phoneNumber: string;
        creditsPack: number;
        status: string;
        failureReason: string | null;
        createdAt: Date;
        user: {
            id: string;
            name: string;
            email: string;
        };
    }[]>;
    approve(paymentId: string): Promise<{
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
    reject(paymentId: string, reason?: string): Promise<{
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
}
