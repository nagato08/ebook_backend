import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, UpdateProfileDto } from './dto/user.dto';

const PUBLIC_SELECT = {
  id: true,
  email: true,
  name: true,
  credits: true,
  emailVerified: true,
  avatarUrl: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /** Met a jour le profil (nom). */
  updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name },
      select: PUBLIC_SELECT,
    });
  }

  /** Change le mot de passe (verifie l'ancien). Refuse les comptes sans password (Google). */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { password: true },
    });

    if (!user.password) {
      throw new BadRequestException(
        'Compte sans mot de passe (connexion Google). Impossible de le changer.',
      );
    }

    const ok = await bcrypt.compare(dto.oldPassword, user.password);
    if (!ok) throw new UnauthorizedException('Ancien mot de passe incorrect');

    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });
    return { message: 'Mot de passe mis a jour' };
  }

  /** Enregistre le chemin de l'avatar uploade. */
  setAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: PUBLIC_SELECT,
    });
  }
}
