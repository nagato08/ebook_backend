import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { randomUUID } from 'crypto';
import {
  PaymentProvider,
  ProviderCollectRequest,
  ProviderCollectResult,
  ProviderStatus,
  ProviderStatusResult,
} from './payment-provider.interface';

/**
 * Provider GeniusPay (https://pay.genius.ci) — checkout hebergé multi-canal
 * (Mobile Money MTN/Orange/Wave + cartes). Accepte les particuliers.
 *
 * Auth: headers X-API-Key (pk_...) + X-API-Secret (sk_...).
 * Si les cles sont absentes -> MODE MOCK (simule SUCCESSFUL).
 * Docs: https://pay.genius.ci/docs/api
 */
@Injectable()
export class GeniusPayService implements PaymentProvider {
  readonly name = 'geniuspay';
  private readonly logger = new Logger(GeniusPayService.name);

  private get baseUrl() {
    return process.env.GENIUSPAY_BASE_URL ?? 'https://pay.genius.ci/api/v1';
  }
  private get apiKey() {
    return process.env.GENIUSPAY_API_KEY ?? '';
  }
  private get apiSecret() {
    return process.env.GENIUSPAY_API_SECRET ?? '';
  }
  get isMock() {
    return !this.apiKey || !this.apiSecret;
  }
  private get headers() {
    return {
      'X-API-Key': this.apiKey,
      'X-API-Secret': this.apiSecret,
      'Content-Type': 'application/json',
    };
  }

  async collect(req: ProviderCollectRequest): Promise<ProviderCollectResult> {
    if (this.isMock) {
      const reference = `MOCK-${randomUUID()}`;
      this.logger.warn(
        `[MOCK] collect ${req.externalReference} -> ${reference}`,
      );
      return { reference, status: 'PENDING', checkoutUrl: undefined };
    }

    try {
      const { data } = await axios.post<{
        data: { reference: string; checkout_url?: string; gateway?: string };
      }>(
        `${this.baseUrl}/merchant/payments`,
        {
          amount: Number(req.amount),
          // GeniusPay n'accepte pas XAF -> XOF (meme valeur CFA, parite 1:1).
          currency: req.currency === 'XAF' ? 'XOF' : req.currency,
          description: (req.description ?? 'Ebook credits').slice(0, 500),
          customer: {
            phone: req.phoneNumber,
            name: req.customerName,
            email: req.customerEmail,
          },
          success_url: process.env.GENIUSPAY_SUCCESS_URL,
          error_url: process.env.GENIUSPAY_ERROR_URL,
          metadata: { externalReference: req.externalReference },
        },
        { headers: this.headers, timeout: 30000 },
      );

      const d = data.data;
      this.logger.log(`collect ${req.externalReference} -> ref ${d.reference}`);
      return {
        reference: d.reference,
        status: 'PENDING',
        operator: d.gateway,
        checkoutUrl: d.checkout_url,
      };
    } catch (e) {
      this.logger.error('GeniusPay collect failed', {
        status: e.response?.status,
        data: e.response?.data,
        message: e.message,
      });
      throw e;
    }
  }

  async status(reference: string): Promise<ProviderStatusResult> {
    if (this.isMock || reference.startsWith('MOCK-')) {
      return { status: 'SUCCESSFUL' };
    }

    const { data } = await axios.get<{
      data: { status?: string };
    }>(`${this.baseUrl}/merchant/payments/${reference}`, {
      headers: this.headers,
      timeout: 30000,
    });
    return { status: this.mapStatus(data.data?.status) };
  }

  /** completed -> SUCCESSFUL ; failed/cancelled/expired/refunded -> FAILED ; sinon PENDING. */
  private mapStatus(s?: string): ProviderStatus {
    if (s === 'completed') return 'SUCCESSFUL';
    if (
      s === 'failed' ||
      s === 'cancelled' ||
      s === 'expired' ||
      s === 'refunded'
    ) {
      return 'FAILED';
    }
    return 'PENDING';
  }
}
