import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CampayService } from './campay.service';
import { GeniusPayService } from './geniuspay.service';
import { PAYMENT_PROVIDER } from './payment-provider.interface';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    CampayService,
    GeniusPayService,
    {
      // Provider actif selon PAYMENT_PROVIDER (defaut geniuspay).
      provide: PAYMENT_PROVIDER,
      useFactory: (campay: CampayService, genius: GeniusPayService) =>
        process.env.PAYMENT_PROVIDER === 'campay' ? campay : genius,
      inject: [CampayService, GeniusPayService],
    },
  ],
})
export class PaymentsModule {}
