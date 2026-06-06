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
var GeniusPayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeniusPayService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
let GeniusPayService = GeniusPayService_1 = class GeniusPayService {
    name = 'geniuspay';
    logger = new common_1.Logger(GeniusPayService_1.name);
    get baseUrl() {
        return process.env.GENIUSPAY_BASE_URL ?? 'https://pay.genius.ci/api/v1';
    }
    get apiKey() {
        return process.env.GENIUSPAY_API_KEY ?? '';
    }
    get apiSecret() {
        return process.env.GENIUSPAY_API_SECRET ?? '';
    }
    get isMock() {
        return !this.apiKey || !this.apiSecret;
    }
    get headers() {
        return {
            'X-API-Key': this.apiKey,
            'X-API-Secret': this.apiSecret,
            'Content-Type': 'application/json',
        };
    }
    async collect(req) {
        if (this.isMock) {
            const reference = `MOCK-${(0, crypto_1.randomUUID)()}`;
            this.logger.warn(`[MOCK] collect ${req.externalReference} -> ${reference}`);
            return { reference, status: 'PENDING', checkoutUrl: undefined };
        }
        const { data } = await axios_1.default.post(`${this.baseUrl}/merchant/payments`, {
            amount: Number(req.amount),
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
        }, { headers: this.headers, timeout: 30000 });
        const d = data.data;
        this.logger.log(`collect ${req.externalReference} -> ref ${d.reference}`);
        return {
            reference: d.reference,
            status: 'PENDING',
            operator: d.gateway,
            checkoutUrl: d.checkout_url,
        };
    }
    async status(reference) {
        if (this.isMock || reference.startsWith('MOCK-')) {
            return { status: 'SUCCESSFUL' };
        }
        const { data } = await axios_1.default.get(`${this.baseUrl}/merchant/payments/${reference}`, {
            headers: this.headers,
            timeout: 30000,
        });
        return { status: this.mapStatus(data.data?.status) };
    }
    mapStatus(s) {
        if (s === 'completed')
            return 'SUCCESSFUL';
        if (s === 'failed' ||
            s === 'cancelled' ||
            s === 'expired' ||
            s === 'refunded') {
            return 'FAILED';
        }
        return 'PENDING';
    }
};
exports.GeniusPayService = GeniusPayService;
exports.GeniusPayService = GeniusPayService = GeniusPayService_1 = __decorate([
    (0, common_1.Injectable)()
], GeniusPayService);
//# sourceMappingURL=geniuspay.service.js.map