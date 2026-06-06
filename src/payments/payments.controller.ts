import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { PaymentsService } from './payments.service';
import { InitiateDepositDto } from './dto/payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Get('packs')
  packs() {
    return this.payments.packs();
  }

  // Operateurs Mobile Money disponibles (live pawaPay ou fallback XOF).
  @Get('providers')
  providers() {
    return this.payments.providers();
  }

  @Post('deposit')
  @UseGuards(JwtAuthGuard)
  deposit(@CurrentUser() user: AuthUser, @Body() dto: InitiateDepositDto) {
    return this.payments.initiate(user.id, dto);
  }

  // Callback public du provider (GeniusPay). Signature verifiee avant traitement.
  @Post('callback')
  callback(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: Record<string, unknown>,
    @Headers('x-webhook-signature') signature?: string,
    @Headers('x-webhook-timestamp') timestamp?: string,
  ) {
    this.payments.verifyWebhook(
      signature,
      timestamp,
      req.rawBody?.toString('utf8'),
    );
    return this.payments.handleCallback(body);
  }

  @Get('deposit/:depositId/status')
  @UseGuards(JwtAuthGuard)
  status(@CurrentUser() user: AuthUser, @Param('depositId') depositId: string) {
    return this.payments.checkAndSync(user.id, depositId);
  }
}
