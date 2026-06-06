import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { CreditsService } from './credits.service';

@Controller('credits')
@UseGuards(JwtAuthGuard)
export class CreditsController {
  constructor(private credits: CreditsService) {}

  @Get('balance')
  async balance(@CurrentUser() user: AuthUser) {
    return { credits: await this.credits.balance(user.id) };
  }

  @Get('ledger')
  ledger(@CurrentUser() user: AuthUser) {
    return this.credits.ledger(user.id);
  }
}
