import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private email: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email deja utilise');

    const hash = await bcrypt.hash(dto.password, 10);
    const verificationToken = this.email.generateToken();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        name: dto.name,
        emailVerificationToken: verificationToken,
      },
    });

    // Trace du bonus de bienvenue
    await this.prisma.creditLedger.create({
      data: {
        userId: user.id,
        delta: user.credits,
        reason: 'signup_bonus',
        balanceAfter: user.credits,
      },
    });

    // Envoyer email de vérification
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    await this.email.sendVerificationEmail(
      user.email,
      verificationToken,
      frontendUrl,
    );

    return this.sign(user.id, user.email, user.name, user.credits);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Identifiants invalides');

    return this.sign(user.id, user.email, user.name, user.credits);
  }

  async googleLogin(profile: {
    googleId: string;
    email: string;
    name: string;
  }) {
    const { email, name } = profile;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Créer user si n'existe pas
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: '',
          emailVerified: true, // Google = trusted email
        },
      });

      // Log signup bonus
      await this.prisma.creditLedger.create({
        data: {
          userId: user.id,
          delta: user.credits,
          reason: 'signup_bonus',
          balanceAfter: user.credits,
        },
      });

      // Envoyer email de bienvenue
      await this.email.sendWelcomeEmail(user.email, user.name || 'User');
    }

    return this.sign(user.id, user.email, user.name, user.credits);
  }

  async sendVerificationEmail(
    email: string,
  ): Promise<{ message: string; token?: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const token = this.email.generateToken();

    await this.prisma.user.update({
      where: { email },
      data: { emailVerificationToken: token },
    });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    await this.email.sendVerificationEmail(email, token, frontendUrl);

    const isDev = process.env.NODE_ENV !== 'production';
    return {
      message: 'Email de vérification envoyé',
      ...(isDev && { token }), // Retourner token en dev pour test
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });
    if (!user) throw new NotFoundException('Token invalide ou expiré');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationToken: null },
    });

    return { message: 'Email vérifié avec succès' };
  }

  private sign(
    id: string,
    email: string,
    name: string | null,
    credits: number,
  ) {
    const token = this.jwt.sign({ sub: id, email });
    return { token, user: { id, email, name, credits } };
  }
}
