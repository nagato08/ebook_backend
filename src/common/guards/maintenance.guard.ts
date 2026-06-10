import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { SettingsService } from '../../settings/settings.service';
import { isAdminRequest } from '../is-admin';

/**
 * Guard global: quand le flag `maintenance` est ON, renvoie 503 sur toutes
 * les routes SAUF la whitelist (statut, login admin, webhook paiement, toggle)
 * et SAUF l'admin (bypass via ADMIN_EMAIL dans le JWT).
 */
@Injectable()
export class MaintenanceGuard implements CanActivate {
  // Routes joignables même en maintenance.
  // - GET /status: le front lit l'état
  // - POST /auth/login + Google: l'admin doit pouvoir se connecter
  // - POST /payments/callback: les webhooks paiement doivent créditer (sinon perdus)
  // - POST /maintenance: pour ressortir de maintenance
  private static readonly WHITELIST = new Set([
    'GET /status',
    'POST /auth/login',
    'GET /auth/google',
    'GET /auth/google/callback',
    'POST /payments/callback',
    'POST /maintenance',
  ]);

  constructor(
    private settings: SettingsService,
    private jwt: JwtService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    if (!(await this.settings.isMaintenance())) return true;

    const path = (req.path || req.url.split('?')[0]).replace(/\/+$/, '') || '/';
    if (MaintenanceGuard.WHITELIST.has(`${req.method} ${path}`)) return true;

    if (isAdminRequest(req, this.jwt)) return true;

    throw new ServiceUnavailableException({
      maintenance: true,
      message: 'Site en maintenance. Reviens dans un moment.',
    });
  }
}
