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
    payments(status?: string, provider?: string, take?: string): Promise<{
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
    approve(id: string): Promise<{
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
    reject(id: string, reason?: string): Promise<{
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
