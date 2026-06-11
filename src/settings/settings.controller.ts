import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { SettingsService } from './settings.service';
import { isAdminEmail, isAdminRequest } from '../common/is-admin';
import { MaintenanceDto } from './dto/maintenance.dto';

@Controller()
export class SettingsController {
  constructor(
    private settings: SettingsService,
    private jwt: JwtService,
  ) {}

  /**
   * Public. Le front lit l'état maintenance + si le porteur du token est admin
   * (pour afficher la page maintenance aux users mais laisser passer l'admin).
   */
  @Get('status')
  async status(@Req() req: Request) {
    return {
      maintenance: await this.settings.isMaintenance(),
      admin: isAdminRequest(req, this.jwt),
    };
  }

  /** Admin only (email dans ADMIN_EMAIL, liste possible). Bascule la maintenance. */
  @Post('maintenance')
  @UseGuards(JwtAuthGuard)
  async toggle(@CurrentUser() user: AuthUser, @Body() dto: MaintenanceDto) {
    if (!isAdminEmail(user.email)) {
      throw new ForbiddenException("Reserve a l'administrateur");
    }
    await this.settings.setMaintenance(dto.on);
    return { maintenance: await this.settings.isMaintenance() };
  }
}
