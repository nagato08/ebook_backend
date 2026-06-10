import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            credits: number;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            credits: number;
        };
    }>;
    googleLogin(): void;
    googleCallback(req: any, res: Response): Promise<void>;
    sendVerificationEmail(email: string): Promise<{
        message: string;
        token?: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
}
