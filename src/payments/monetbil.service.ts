import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { randomUUID } from 'crypto';
import {
  PaymentProvider,
  ProviderCollectRequest,
  ProviderCollectResult,
  ProviderStatusResult,
} from './payment-provider.interface';

/**
 * Provider Monetbil (https://www.monetbil.com) — Widget API v2.1.
 * Agregateur Mobile Money camerounais (MTN MoMo + Orange Money), XAF natif.
 * Accepte les particuliers; encaissement possible meme service "Non approuve"
 * (l'approbation debloque surtout le retrait/cash-out).
 *
 * Flux: POST widget -> renvoie payment_url -> redirection client.
 * Resultat notifie via webhook (cf. PaymentsService.handleMonetbilCallback).
 * Si service_key/secret absents -> MODE MOCK (simule SUCCESSFUL).
 */
@Injectable()
export class MonetbilService implements PaymentProvider {
  readonly name = 'monetbil';
  private readonly logger = new Logger(MonetbilService.name);

  private get serviceKey() {
    return process.env.MONETBIL_SERVICE_KEY ?? '';
  }
  private get serviceSecret() {
    return process.env.MONETBIL_SERVICE_SECRET ?? '';
  }
  get isMock() {
    return !this.serviceKey || !this.serviceSecret;
  }

  async collect(req: ProviderCollectRequest): Promise<ProviderCollectResult> {
    if (this.isMock) {
      const reference = `MOCK-${randomUUID()}`;
      this.logger.warn(
        `[MOCK] collect ${req.externalReference} -> ${reference}`,
      );
      return { reference, status: 'PENDING' };
    }

    try {
      const body = new URLSearchParams();
      body.set('amount', String(Number(req.amount)));
      // Monetbil accepte XAF nativement (pas de mapping comme GeniusPay).
      body.set('currency', req.currency || 'XAF');
      body.set('country', 'CM');
      // payment_ref = notre depositId -> renvoye tel quel dans la notification.
      body.set('payment_ref', req.externalReference);
      body.set('item_ref', req.description ?? 'credits');
      body.set('user', req.customerEmail || req.externalReference);
      if (req.customerName) body.set('first_name', req.customerName);
      if (req.customerEmail) body.set('email', req.customerEmail);
      // phone optionnel; si fourni, Monetbil verrouille le numero (phone_lock).
      if (req.phoneNumber) body.set('phone', req.phoneNumber);
      if (process.env.MONETBIL_NOTIFY_URL) {
        body.set('notify_url', process.env.MONETBIL_NOTIFY_URL);
      }
      if (process.env.MONETBIL_RETURN_URL) {
        body.set('return_url', process.env.MONETBIL_RETURN_URL);
      }

      const { data } = await axios.post<{
        success: boolean;
        payment_url?: string;
      }>(
        `https://api.monetbil.com/widget/v2.1/${this.serviceKey}`,
        body.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 30000,
        },
      );

      if (!data.success || !data.payment_url) {
        throw new Error(`Monetbil widget refus: ${JSON.stringify(data)}`);
      }

      this.logger.log(
        `collect ${req.externalReference} -> ${data.payment_url}`,
      );
      // Monetbil ne fournit pas de transaction_id a la creation: on garde
      // notre depositId comme reference (la notification matche sur payment_ref).
      return {
        reference: req.externalReference,
        status: 'PENDING',
        checkoutUrl: data.payment_url,
      };
    } catch (e) {
      this.logger.error('Monetbil collect failed', {
        status: e.response?.status,
        data: e.response?.data,
        message: e.message,
      });
      throw e;
    }
  }

  /**
   * Le Widget API v2.1 n'expose pas d'endpoint de statut: le webhook fait foi.
   * Le polling front lit le statut en DB (mis a jour par handleMonetbilCallback).
   */
  status(reference: string): Promise<ProviderStatusResult> {
    if (this.isMock || reference.startsWith('MOCK-')) {
      return Promise.resolve({ status: 'SUCCESSFUL' });
    }
    return Promise.resolve({ status: 'PENDING' });
  }
}
