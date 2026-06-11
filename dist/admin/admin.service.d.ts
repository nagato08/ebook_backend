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
            email: string;
            name: string;
            id: string;
            credits: number;
            emailVerified: boolean;
            createdAt: Date;
            _count: {
                books: number;
                payments: number;
            };
        }[];
    }>;
    user(id: string): Promise<{
        user: {
            email: string;
            name: string;
            id: string;
            avatarUrl: string | null;
            credits: number;
            emailVerified: boolean;
            createdAt: Date;
        };
        books: {
            id: string;
            createdAt: Date;
            title: string;
            status: string;
            unlocked: boolean;
        }[];
        payments: {
            id: string;
            createdAt: Date;
            status: string;
            phoneNumber: string;
            currency: string;
            providerRef: string | null;
            amount: string;
            provider: string | null;
            creditsPack: number;
        }[];
        ledger: {
            id: string;
            createdAt: Date;
            delta: number;
            reason: string;
            balanceAfter: number;
        }[];
    }>;
    paymentsList(opts: {
        status?: string;
        provider?: string;
        take?: number;
    }): Promise<{
        user: {
            email: string;
            name: string;
            id: string;
        };
        id: string;
        createdAt: Date;
        status: string;
        phoneNumber: string;
        currency: string;
        providerRef: string | null;
        amount: string;
        provider: string | null;
        creditsPack: number;
        failureReason: string | null;
    }[]>;
    approve(paymentId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        updatedAt: Date;
        phoneNumber: string;
        currency: string;
        depositId: string;
        providerRef: string | null;
        amount: string;
        provider: string | null;
        creditsPack: number;
        failureReason: string | null;
    } | null>;
    reject(paymentId: string, reason?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        updatedAt: Date;
        phoneNumber: string;
        currency: string;
        depositId: string;
        providerRef: string | null;
        amount: string;
        provider: string | null;
        creditsPack: number;
        failureReason: string | null;
    } | null>;
}
