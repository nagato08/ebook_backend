"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MonetbilService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonetbilService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
let MonetbilService = MonetbilService_1 = class MonetbilService {
    name = 'monetbil';
    logger = new common_1.Logger(MonetbilService_1.name);
    get serviceKey() {
        return process.env.MONETBIL_SERVICE_KEY ?? '';
    }
    get serviceSecret() {
        return process.env.MONETBIL_SERVICE_SECRET ?? '';
    }
    get isMock() {
        return !this.serviceKey || !this.serviceSecret;
    }
    async collect(req) {
        if (this.isMock) {
            const reference = `MOCK-${(0, crypto_1.randomUUID)()}`;
            this.logger.warn(`[MOCK] collect ${req.externalReference} -> ${reference}`);
            return { reference, status: 'PENDING' };
        }
        try {
            const body = new URLSearchParams();
            body.set('amount', String(Number(req.amount)));
            body.set('currency', req.currency || 'XAF');
            body.set('country', 'CM');
            body.set('payment_ref', req.externalReference);
            body.set('item_ref', req.description ?? 'credits');
            body.set('user', req.customerEmail || req.externalReference);
            if (req.customerName)
                body.set('first_name', req.customerName);
            if (req.customerEmail)
                body.set('email', req.customerEmail);
            if (req.phoneNumber)
                body.set('phone', req.phoneNumber);
            if (process.env.MONETBIL_NOTIFY_URL) {
                body.set('notify_url', process.env.MONETBIL_NOTIFY_URL);
            }
            if (process.env.MONETBIL_RETURN_URL) {
                body.set('return_url', process.env.MONETBIL_RETURN_URL);
            }
            const { data } = await axios_1.default.post(`https://api.monetbil.com/widget/v2.1/${this.serviceKey}`, body.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 30000,
            });
            if (!data.success || !data.payment_url) {
                throw new Error(`Monetbil widget refus: ${JSON.stringify(data)}`);
            }
            this.logger.log(`collect ${req.externalReference} -> ${data.payment_url}`);
            return {
                reference: req.externalReference,
                status: 'PENDING',
                checkoutUrl: data.payment_url,
            };
        }
        catch (e) {
            this.logger.error('Monetbil collect failed', {
                status: e.response?.status,
                data: e.response?.data,
                message: e.message,
            });
            throw e;
        }
    }
    status(reference) {
        if (this.isMock || reference.startsWith('MOCK-')) {
            return Promise.resolve({ status: 'SUCCESSFUL' });
        }
        return Promise.resolve({ status: 'PENDING' });
    }
};
exports.MonetbilService = MonetbilService;
exports.MonetbilService = MonetbilService = MonetbilService_1 = __decorate([
    (0, common_1.Injectable)()
], MonetbilService);
//# sourceMappingURL=monetbil.service.js.map