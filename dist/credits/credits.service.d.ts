import { PrismaService } from '../prisma/prisma.service';
export declare class CreditsService {
    private prisma;
    constructor(prisma: PrismaService);
    balance(userId: string): Promise<number>;
    ledger(userId: string): unknown;
    private label;
    debit(userId: string, amount: number, reason: string): unknown;
    credit(userId: string, amount: number, reason: string): unknown;
    private applyDelta;
}
