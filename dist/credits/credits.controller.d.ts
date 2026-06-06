import type { AuthUser } from '../auth/current-user.decorator';
import { CreditsService } from './credits.service';
export declare class CreditsController {
    private credits;
    constructor(credits: CreditsService);
    balance(user: AuthUser): unknown;
    ledger(user: AuthUser): unknown;
}
