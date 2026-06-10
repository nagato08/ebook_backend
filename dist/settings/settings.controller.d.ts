import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthUser } from '../auth/current-user.decorator';
import { SettingsService } from './settings.service';
import { MaintenanceDto } from './dto/maintenance.dto';
export declare class SettingsController {
    private settings;
    private jwt;
    constructor(settings: SettingsService, jwt: JwtService);
    status(req: Request): Promise<{
        maintenance: boolean;
        admin: boolean;
    }>;
    toggle(user: AuthUser, dto: MaintenanceDto): Promise<{
        maintenance: boolean;
    }>;
}
