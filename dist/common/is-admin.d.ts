import { JwtService } from '@nestjs/jwt';
export declare function isAdminRequest(req: {
    headers: Record<string, unknown>;
}, jwt: JwtService): boolean;
