import type { AuthUser } from '../auth/current-user.decorator';
import { CreditsService } from './credits.service';
export declare class CreditsController {
    private credits;
    constructor(credits: CreditsService);
    balance(user: AuthUser): Promise<{
        credits: number;
    }>;
    ledger(user: AuthUser): Promise<{
        label: string;
        id: string;
        createdAt: Date;
        delta: number;
        reason: string;
        balanceAfter: number;
        userId: string;
    }[]>;
}
