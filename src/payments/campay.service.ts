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
 * Wrapper de l'API CamPay (Mobile Money Cameroun: MTN / Orange).
 * Auth: permanent access token (dashboard > APP KEYS) -> header "Authorization: Token <token>".
 * Docs: https://documenter.getpostman.com/view/2391374/T1LV8PVA
 *
 * Si CAMPAY_PERMANENT_TOKEN absent -> MODE MOCK (simule SUCCESSFUL) pour tester
 * la chaine credits sans compte CamPay.
 */
@Injectable()
export class CampayService implements PaymentProvider {
  readonly name = 'campay';
  private readonly logger = new Logger(CampayService.name);

  private get baseUrl() {
    return process.env.CAMPAY_BASE_URL ?? 'https://demo.campay.net/api';
  }
  private get token() {
    return process.env.CAMPAY_PERMANENT_TOKEN ?? '';
  }
  get isMock() {
    return !this.token;
  }
  private get isDemo() {
    return this.baseUrl.includes('demo.campay');
  }
  private get headers() {
    return {
      Authorization: `Token ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  /** Demande de paiement (request-to-pay). Le client recoit un prompt PIN sur son tel. */
  async collect(req: ProviderCollectRequest): Promise<ProviderCollectResult> {
    if (this.isMock) {
      const reference = `MOCK-${randomUUID()}`;
      this.logger.warn(
        `[MOCK] collect ${req.externalReference} -> ${reference}`,
      );
      return { reference, status: 'PENDING', operator: 'MOCK' };
    }

    // Demo CamPay: montant plafonne a 25 XAF (ER201). On cape pour pouvoir tester
    // le flux complet sans modifier les packs (la prod utilise le vrai montant).
    const amount = this.isDemo ? '25' : req.amount;
    if (this.isDemo && amount !== req.amount) {
      this.logger.warn(`[DEMO] montant cape ${req.amount} -> ${amount} XAF`);
    }

    const { data } = await axios.post<{
      reference: string;
      ussd_code?: string;
      operator?: string;
    }>(
      `${this.baseUrl}/collect/`,
      {
        amount,
        currency: req.currency,
        from: req.phoneNumber,
        description: (req.description ?? 'Ebook credits').slice(0, 64),
        external_reference: req.externalReference,
      },
      { headers: this.headers, timeout: 30000 },
    );
    this.logger.log(
      `collect ${req.externalReference} -> ref ${data.reference}`,
    );
    return {
      reference: data.reference,
      ussdCode: data.ussd_code,
      operator: data.operator,
      status: 'PENDING',
    };
  }

  /** Statut d'une transaction via la reference CamPay. */
  async status(reference: string): Promise<ProviderStatusResult> {
    // En mock, une ref MOCK- est consideree comme reussie (settle immediat).
    if (this.isMock || reference.startsWith('MOCK-')) {
      return { status: 'SUCCESSFUL' };
    }

    const { data } = await axios.get<{
      status?: string;
      reason?: string;
    }>(`${this.baseUrl}/transaction/${reference}/`, {
      headers: this.headers,
      timeout: 30000,
    });
    return {
      status: this.mapStatus(data.status),
      failureReason: data.reason,
    };
  }

  /** Normalise le statut CamPay vers ProviderStatus. */
  private mapStatus(s?: string): ProviderStatus {
    if (s === 'SUCCESSFUL') return 'SUCCESSFUL';
    if (s === 'FAILED') return 'FAILED';
    return 'PENDING';
  }
}
