import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('Non authentifié');
    }

    // Récupérer user avec emailVerified
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { emailVerified: true },
    });

    if (!dbUser?.emailVerified) {
      throw new ForbiddenException(
        'Veuillez vérifier votre email avant de procéder',
      );
    }

    return true;
  }
}
