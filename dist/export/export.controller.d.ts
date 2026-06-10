import type { Response } from 'express';
import type { AuthUser } from '../auth/current-user.decorator';
import { ExportService } from './export.service';
export declare class ExportController {
    private exportService;
    constructor(exportService: ExportService);
    pdf(user: AuthUser, id: string, res: Response): Promise<void>;
    epub(user: AuthUser, id: string, res: Response): Promise<void>;
    private send;
}
