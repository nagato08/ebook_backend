import { AdminService } from './admin.service';
export declare class AdminController {
    private admin;
    constructor(admin: AdminService);
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
    users(search?: string, skip?: string, take?: string): Promise<{
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
    payments(status?: string, provider?: string, take?: string): Promise<{
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
    approve(id: string): Promise<{
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
    reject(id: string, reason?: string): Promise<{
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
