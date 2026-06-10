import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CampayService } from './campay.service';
import { GeniusPayService } from './geniuspay.service';
import { MonetbilService } from './monetbil.service';
import { PAYMENT_PROVIDER } from './payment-provider.interface';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    CampayService,
    GeniusPayService,
    MonetbilService,
    {
      // Provider actif selon PAYMENT_PROVIDER (defaut geniuspay).
      provide: PAYMENT_PROVIDER,
      useFactory: (
        campay: CampayService,
        genius: GeniusPayService,
        monetbil: MonetbilService,
      ) => {
        const p = process.env.PAYMENT_PROVIDER;
        if (p === 'campay') return campay;
        if (p === 'monetbil') return monetbil;
        return genius;
      },
      inject: [CampayService, GeniusPayService, MonetbilService],
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
