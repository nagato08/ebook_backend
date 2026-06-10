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
import { InitiateDepositDto, ManualPaymentDto } from './dto/payment.dto';

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

  // Paiement manuel: l'user a payé sur le MoMo de l'admin et soumet sa preuve.
  @Post('manual')
  @UseGuards(JwtAuthGuard)
  manual(@CurrentUser() user: AuthUser, @Body() dto: ManualPaymentDto) {
    return this.payments.createManual(
      user.id,
      dto.packId,
      dto.senderPhone,
      dto.txId,
    );
  }

  // Callback public du provider actif. Le dispatcher verifie la signature
  // (HMAC GeniusPay/CamPay ou MD5 Monetbil) AVANT de crediter.
  @Post('callback')
  callback(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: Record<string, unknown>,
    @Headers('x-webhook-signature') signature?: string,
    @Headers('x-webhook-timestamp') timestamp?: string,
  ) {
    return this.payments.handleWebhook(body, {
      rawBody: req.rawBody?.toString('utf8'),
      signature,
      timestamp,
    });
  }

  @Get('deposit/:depositId/status')
  @UseGuards(JwtAuthGuard)
  status(@CurrentUser() user: AuthUser, @Param('depositId') depositId: string) {
    return this.payments.checkAndSync(user.id, depositId);
  }
}
