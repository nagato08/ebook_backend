"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const credits_service_1 = require("../credits/credits.service");
const payment_provider_interface_1 = require("./payment-provider.interface");
const credit_packs_1 = require("./credit-packs");
const payment_providers_1 = require("./payment-providers");
const SUCCESS = 'SUCCESSFUL';
const FAILED = 'FAILED';
const mbStr = (v) => (typeof v === 'string' ? v : '');
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    credits;
    provider;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(prisma, credits, provider) {
        this.prisma = prisma;
        this.credits = credits;
        this.provider = provider;
    }
    packs() {
        return credit_packs_1.CREDIT_PACKS;
    }
    providers() {
        return {
            provider: this.provider.name,
            source: this.provider.isMock ? 'mock' : 'live',
            providers: payment_providers_1.CAMPAY_OPERATORS,
        };
    }
    async initiate(userId, dto) {
        const pack = (0, credit_packs_1.findPack)(dto.packId);
        if (!pack)
            throw new common_1.BadRequestException('Pack inconnu');
        const phoneNumber = (dto.phoneNumber ?? '').replace(/[^0-9]/g, '');
        if (phoneNumber && phoneNumber.length < 8) {
            throw new common_1.BadRequestException('Numero de telephone invalide');
        }
        const depositId = (0, crypto_1.randomUUID)();
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
        let res;
        try {
            res = await this.provider.collect({
                amount: pack.amount,
                currency,
                phoneNumber,
                externalReference: depositId,
                description: `${pack.credits} credits`,
            });
        }
        catch (e) {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: FAILED, failureReason: String(e).slice(0, 250) },
            });
            throw new common_1.BadRequestException("Echec de l'initiation du paiement");
        }
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { providerRef: res.reference, provider: res.operator },
        });
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
    async handleWebhook(body, opts) {
        if (this.provider.name === 'monetbil') {
            return this.handleMonetbilCallback(body);
        }
        this.verifyWebhook(opts.signature, opts.timestamp, opts.rawBody);
        return this.handleCallback(body);
    }
    verifyWebhook(signature, timestamp, rawBody) {
        const secret = process.env.GENIUSPAY_WEBHOOK_SECRET;
        if (!secret) {
            this.logger.warn('Webhook non verifie (GENIUSPAY_WEBHOOK_SECRET absent)');
            return;
        }
        if (!signature || !timestamp || rawBody === undefined) {
            throw new common_1.UnauthorizedException('Signature webhook manquante');
        }
        const expected = (0, crypto_1.createHmac)('sha256', secret)
            .update(`${timestamp}.${rawBody}`)
            .digest('hex');
        const a = Buffer.from(signature);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !(0, crypto_1.timingSafeEqual)(a, b)) {
            throw new common_1.UnauthorizedException('Signature webhook invalide');
        }
    }
    async handleCallback(body) {
        const data = (body.data ?? body);
        const meta = (data.metadata ?? {});
        const ref = data.reference ?? undefined;
        const extRef = data.external_reference ??
            meta.externalReference ??
            undefined;
        const rawStatus = body.event ?? data.status ?? 'UNKNOWN';
        if (!ref && !extRef) {
            throw new common_1.BadRequestException('reference manquante');
        }
        const payment = await this.prisma.payment.findFirst({
            where: extRef ? { depositId: extRef } : { providerRef: ref },
        });
        if (!payment) {
            this.logger.warn(`Callback ref inconnue: ${ref ?? extRef}`);
            return { ok: true };
        }
        await this.applyFinalStatus(payment.id, this.normalizeStatus(rawStatus), data.reason);
        return { ok: true };
    }
    async handleMonetbilCallback(params) {
        this.verifyMonetbilNotification(params);
        const depositId = params.payment_ref;
        if (!depositId)
            throw new common_1.BadRequestException('payment_ref manquant');
        const status = mbStr(params.status).toLowerCase();
        const payment = await this.prisma.payment.findFirst({
            where: { depositId },
        });
        if (!payment) {
            this.logger.warn(`Callback Monetbil ref inconnue: ${depositId}`);
            return 'received';
        }
        const normalized = status === 'success'
            ? SUCCESS
            : status === 'failed' || status === 'cancelled'
                ? FAILED
                : 'PENDING';
        await this.applyFinalStatus(payment.id, normalized, params.message);
        return 'received';
    }
    verifyMonetbilNotification(params) {
        const secret = process.env.MONETBIL_SERVICE_SECRET;
        if (!secret) {
            this.logger.warn('Webhook Monetbil non verifie (MONETBIL_SERVICE_SECRET absent)');
            return;
        }
        const sign = params.sign;
        if (!sign)
            throw new common_1.UnauthorizedException('Signature Monetbil manquante');
        const keys = Object.keys(params)
            .filter((k) => k !== 'sign')
            .sort();
        const concat = keys.map((k) => mbStr(params[k])).join('');
        const expected = (0, crypto_1.createHash)('md5')
            .update(secret + concat)
            .digest('hex');
        const a = Buffer.from(sign);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !(0, crypto_1.timingSafeEqual)(a, b)) {
            throw new common_1.UnauthorizedException('Signature Monetbil invalide');
        }
    }
    normalizeStatus(s) {
        const v = s.toLowerCase();
        if (v === 'successful' || v === 'completed' || v === 'payment.success') {
            return SUCCESS;
        }
        if (['failed', 'cancelled', 'expired', 'refunded', 'payment.failed'].includes(v)) {
            return FAILED;
        }
        return 'PENDING';
    }
    async checkAndSync(userId, depositId) {
        const payment = await this.prisma.payment.findUnique({
            where: { depositId },
        });
        if (!payment || payment.userId !== userId) {
            throw new common_1.NotFoundException('Paiement introuvable');
        }
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
    async applyFinalStatus(paymentId, status, failureReason) {
        const payment = await this.prisma.payment.findUniqueOrThrow({
            where: { id: paymentId },
        });
        if (payment.status === SUCCESS)
            return;
        if (status === SUCCESS) {
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: { status: SUCCESS },
            });
            await this.credits.credit(payment.userId, payment.creditsPack, `purchase:${payment.depositId}`);
            this.logger.log(`Paiement ${payment.depositId} OK -> +${payment.creditsPack} credits`);
        }
        else if (status === FAILED) {
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: { status: FAILED, failureReason: failureReason ?? undefined },
            });
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(payment_provider_interface_1.PAYMENT_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        credits_service_1.CreditsService, Object])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map