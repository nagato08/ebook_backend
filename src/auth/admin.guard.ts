import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AuthUser } from './current-user.decorator';

/**
 * Réserve la route à l'admin (email == ADMIN_EMAIL).
 * À combiner APRÈS JwtAuthGuard : @UseGuards(JwtAuthGuard, AdminGuard)
 * (JwtAuthGuard pose req.user, AdminGuard vérifie l'email).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || req.user?.email !== adminEmail) {
      throw new ForbiddenException("Reserve a l'administrateur");
    }
    return true;
  }
}
