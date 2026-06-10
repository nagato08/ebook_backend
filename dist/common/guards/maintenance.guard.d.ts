import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SettingsService } from '../../settings/settings.service';
export declare class MaintenanceGuard implements CanActivate {
    private settings;
    private jwt;
    private static readonly WHITELIST;
    constructor(settings: SettingsService, jwt: JwtService);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
