import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    private email;
    constructor(prisma: PrismaService, jwt: JwtService, email: EmailService);
    register(dto: RegisterDto): unknown;
    login(dto: LoginDto): unknown;
    googleLogin(profile: {
        googleId: string;
        email: string;
        name: string;
    }): unknown;
    sendVerificationEmail(email: string): Promise<{
        message: string;
        token?: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    private sign;
}
