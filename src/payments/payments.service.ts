import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { PAYMENT_PROVIDER } from './payment-provider.interface';
import type {
  PaymentProvider,
  ProviderCollectResult,
} from './payment-provider.interface';
import { InitiateDepositDto } from './dto/payment.dto';
import { CREDIT_PACKS, findPack } from './credit-packs';
import { CAMPAY_OPERATORS } from './payment-providers';

const SUCCESS = 'SUCCESSFUL';
const FAILED = 'FAILED';

/** Coerce une valeur de param form-encoded (toujours string) en string sure. */
const mbStr = (v: unknown): string => (typeof v === 'string' ? v : '');

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private credits: CreditsService,
    @Inject(PAYMENT_PROVIDER) private provider: PaymentProvider,
  ) {}

  packs() {
    return CREDIT_PACKS;
  }

  /** Operateurs Mobile Money disponibles + provider actif. */
  providers() {
    return {
      provider: this.provider.name,
      source: this.provider.isMock ? ('mock' as const) : ('live' as const),
      providers: CAMPAY_OPERATORS,
    };
  }

  async initiate(userId: string, dto: InitiateDepositDto) {
    const pack = findPack(dto.packId);
    if (!pack) throw new BadRequestException('Pack inconnu');

    // Optionnel (GeniusPay checkout demande le numero sur sa page).
    // Si fourni, on nettoie (chiffres only) et valide; sinon chaine vide.
    const phoneNumber = (dto.phoneNumber ?? '').replace(/[^0-9]/g, '');
    if (phoneNumber && phoneNumber.length < 8) {
      throw new BadRequestException('Numero de telephone invalide');
    }

    const depositId = randomUUID(); // notre external_reference
    const currency = dto.currency ?? pack.currency;

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        depositId,
        amount: pack.amount,
        currency,
        phoneNumber,
        creditsPack: pack.credits,
        status: 'PENDING',
      },
    });

    let res: ProviderCollectResult;
    try {
      res = await this.provider.collect({
        amount: pack.amount,
        currency,
        phoneNumber,
        externalReference: depositId,
        description: `${pack.credits} credits`,
      });
    } catch (e) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: FAILED, failureReason: String(e).slice(0, 250) },
      });
      throw new BadRequestException("Echec de l'initiation du paiement");
    }

    // Reference provider (sert au polling) + operateur/gateway detecte.
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { providerRef: res.reference, provider: res.operator },
    });

    // checkoutUrl (GeniusPay -> redirection) ou ussdCode (CamPay -> prompt PIN).
    const message = res.checkoutUrl
      ? 'Redirection vers la page de paiement.'
      : 'Demande envoyee. Validez le paiement sur votre telephone (code PIN).';

    return {
      depositId,
      status: 'PENDING',
      checkoutUrl: res.checkoutUrl,
      ussdCode: res.ussdCode,
      operator: res.operator,
      pack: {
        id: pack.id,
        credits: pack.credits,
        amount: pack.amount,
        currency,
      },
      message,
    };
  }

  /**
   * Point d'entree unique du webhook /payments/callback.
   * Dispatch selon le provider actif (formats/signatures differents):
   *  - monetbil: form-encoded + signature MD5 -> repond le texte "received"
   *  - geniuspay/campay: JSON + HMAC-SHA256 -> repond { ok: true }
   */
  async handleWebhook(
    body: Record<string, unknown>,
    opts: { rawBody?: string; signature?: string; timestamp?: string },
  ): Promise<{ ok: boolean } | string> {
    if (this.provider.name === 'monetbil') {
      return this.handleMonetbilCallback(body);
    }
    this.verifyWebhook(opts.signature, opts.timestamp, opts.rawBody);
    return this.handleCallback(body);
  }

  /**
   * Verifie la signature HMAC d'un webhook GeniusPay AVANT traitement.
   * Formule: HMAC-SHA256(`${timestamp}.${rawBody}`, whsec) compare a X-Webhook-Signature.
   * Si GENIUSPAY_WEBHOOK_SECRET absent (sandbox) -> on saute la verif (warn).
   * Leve UnauthorizedException si la signature est invalide.
   */
  verifyWebhook(signature?: string, timestamp?: string, rawBody?: string) {
    const secret = process.env.GENIUSPAY_WEBHOOK_SECRET;
    if (!secret) {
      this.logger.warn('Webhook non verifie (GENIUSPAY_WEBHOOK_SECRET absent)');
      return;
    }
    if (!signature || !timestamp || rawBody === undefined) {
      throw new UnauthorizedException('Signature webhook manquante');
    }

    const expected = createHmac('sha256', secret)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex');

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Signature webhook invalide');
    }
  }

  /**
   * Callback public du provider. Gere les 2 formats:
   *  - CamPay: { reference, external_reference, status:"SUCCESSFUL", reason }
   *  - GeniusPay: { event, data:{ reference, status:"completed", metadata } }
   * Idempotent: credite une seule fois.
   * NOTE prod: verifier la signature (CAMPAY_WEBHOOK_KEY / GENIUSPAY_WEBHOOK_SECRET)
   * AVANT de traiter -- a brancher dans le controller.
   */
  async handleCallback(body: Record<string, unknown>) {
    const data = (body.data ?? body) as Record<string, unknown>;
    const meta = (data.metadata ?? {}) as Record<string, unknown>;

    const ref = (data.reference as string) ?? undefined;
    const extRef =
      (data.external_reference as string) ??
      (meta.externalReference as string) ??
      undefined;
    const rawStatus =
      (body.event as string) ?? (data.status as string) ?? 'UNKNOWN';

    if (!ref && !extRef) {
      throw new BadRequestException('reference manquante');
    }

    const payment = await this.prisma.payment.findFirst({
      where: extRef ? { depositId: extRef } : { providerRef: ref },
    });
    if (!payment) {
      this.logger.warn(`Callback ref inconnue: ${ref ?? extRef}`);
      return { ok: true };
    }

    await this.applyFinalStatus(
      payment.id,
      this.normalizeStatus(rawStatus),
      data.reason as string | undefined,
    );
    return { ok: true };
  }

  /**
   * Notification Monetbil (Widget v2.1). Params form-encoded incluant `sign`.
   * Securite: signature MD5 verifiee AVANT credit. Repond "received" (attendu
   * par Monetbil). Idempotent (applyFinalStatus credite une seule fois).
   * Statuts: success -> SUCCESSFUL ; cancelled/failed -> FAILED.
   */
  async handleMonetbilCallback(
    params: Record<string, unknown>,
  ): Promise<string> {
    this.verifyMonetbilNotification(params);

    const depositId = params.payment_ref as string | undefined;
    if (!depositId) throw new BadRequestException('payment_ref manquant');

    const status = mbStr(params.status).toLowerCase();
    const payment = await this.prisma.payment.findFirst({
      where: { depositId },
    });
    if (!payment) {
      this.logger.warn(`Callback Monetbil ref inconnue: ${depositId}`);
      return 'received';
    }

    const normalized =
      status === 'success'
        ? SUCCESS
        : status === 'failed' || status === 'cancelled'
          ? FAILED
          : 'PENDING';

    await this.applyFinalStatus(
      payment.id,
      normalized,
      params.message as string | undefined,
    );
    return 'received';
  }

  /**
   * Verifie la signature MD5 d'une notification Monetbil AVANT traitement.
   * Formule officielle: sign = md5(service_secret + valeurs des params tries
   * par cle, hors `sign`, concatenees sans separateur).
   * Si MONETBIL_SERVICE_SECRET absent (mock) -> on saute la verif (warn).
   * Leve UnauthorizedException si la signature est invalide.
   */
  private verifyMonetbilNotification(params: Record<string, unknown>): void {
    const secret = process.env.MONETBIL_SERVICE_SECRET;
    if (!secret) {
      this.logger.warn(
        'Webhook Monetbil non verifie (MONETBIL_SERVICE_SECRET absent)',
      );
      return;
    }

    const sign = params.sign as string | undefined;
    if (!sign) throw new UnauthorizedException('Signature Monetbil manquante');

    // Concatene les valeurs des params (hors `sign`) tries par cle.
    const keys = Object.keys(params)
      .filter((k) => k !== 'sign')
      .sort();
    const concat = keys.map((k) => mbStr(params[k])).join('');
    const expected = createHash('md5')
      .update(secret + concat)
      .digest('hex');

    const a = Buffer.from(sign);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Signature Monetbil invalide');
    }
  }

  /** Mappe les statuts/events des providers vers SUCCESSFUL | FAILED | PENDING. */
  private normalizeStatus(s: string): string {
    const v = s.toLowerCase();
    if (v === 'successful' || v === 'completed' || v === 'payment.success') {
      return SUCCESS;
    }
    if (
      ['failed', 'cancelled', 'expired', 'refunded', 'payment.failed'].includes(
        v,
      )
    ) {
      return FAILED;
    }
    return 'PENDING';
  }

  /** Verifie le statut aupres du provider (polling). */
  async checkAndSync(userId: string, depositId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { depositId },
    });
    if (!payment || payment.userId !== userId) {
      throw new NotFoundException('Paiement introuvable');
    }

    // Pas encore de reference provider (echec a l'initiation) -> rien a verifier.
    if (payment.providerRef) {
      const res = await this.provider.status(payment.providerRef);
      await this.applyFinalStatus(payment.id, res.status, res.failureReason);
    }

    const fresh = await this.prisma.payment.findUnique({
      where: { depositId },
    });
    return {
      depositId,
      status: fresh?.status,
      credited: fresh?.status === SUCCESS,
    };
  }

  /** Transition vers statut final + credit unique. */
  private async applyFinalStatus(
    paymentId: string,
    status: string,
    failureReason?: string,
  ) {
    const payment = await this.prisma.payment.findUniqueOrThrow({
      where: { id: paymentId },
    });

    if (payment.status === SUCCESS) return; // deja credite

    if (status === SUCCESS) {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: SUCCESS },
      });
      await this.credits.credit(
        payment.userId,
        payment.creditsPack,
        `purchase:${payment.depositId}`,
      );
      this.logger.log(
        `Paiement ${payment.depositId} OK -> +${payment.creditsPack} credits`,
      );
    } else if (status === FAILED) {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: FAILED, failureReason: failureReason ?? undefined },
      });
    }
    // PENDING / inconnu -> on ne change rien (on re-pollera)
  }
}
