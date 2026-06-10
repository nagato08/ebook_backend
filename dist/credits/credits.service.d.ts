import { PrismaService } from '../prisma/prisma.service';
export declare class CreditsService {
    private prisma;
    constructor(prisma: PrismaService);
    balance(userId: string): Promise<number>;
    ledger(userId: string): Promise<{
        label: string;
        id: string;
        createdAt: Date;
        delta: number;
        reason: string;
        balanceAfter: number;
        userId: string;
    }[]>;
    private label;
    debit(userId: string, amount: number, reason: string): Promise<number>;
    credit(userId: string, amount: number, reason: string): Promise<number>;
    private applyDelta;
}
