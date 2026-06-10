import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    private email;
    constructor(prisma: PrismaService, jwt: JwtService, email: EmailService);
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
    googleLogin(profile: {
        googleId: string;
        email: string;
        name: string;
    }): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            credits: number;
        };
    }>;
    sendVerificationEmail(email: string): Promise<{
        message: string;
        token?: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    private sign;
}
