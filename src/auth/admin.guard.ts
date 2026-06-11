import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AuthUser } from './current-user.decorator';
import { isAdminEmail } from '../common/is-admin';

/**
 * Réserve la route aux admins (email dans ADMIN_EMAIL, liste possible).
 * À combiner APRÈS JwtAuthGuard : @UseGuards(JwtAuthGuard, AdminGuard)
 * (JwtAuthGuard pose req.user, AdminGuard vérifie l'email).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!isAdminEmail(req.user?.email)) {
      throw new ForbiddenException("Reserve a l'administrateur");
    }
    return true;
  }
}
