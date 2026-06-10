import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

// Toutes les routes: JWT valide + email == ADMIN_EMAIL.
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('stats')
  stats() {
    return this.admin.stats();
  }

  @Get('users')
  users(
    @Query('search') search?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.admin.users({
      search: search?.trim() || undefined,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
  }

  @Get('users/:id')
  user(@Param('id') id: string) {
    return this.admin.user(id);
  }

  @Get('payments')
  payments(
    @Query('status') status?: string,
    @Query('provider') provider?: string,
    @Query('take') take?: string,
  ) {
    return this.admin.paymentsList({
      status: status || undefined,
      provider: provider || undefined,
      take: take ? Number(take) : undefined,
    });
  }

  @Post('payments/:id/approve')
  approve(@Param('id') id: string) {
    return this.admin.approve(id);
  }

  @Post('payments/:id/reject')
  reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.admin.reject(id, reason);
  }
}
