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
var CampayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampayService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
let CampayService = CampayService_1 = class CampayService {
    name = 'campay';
    logger = new common_1.Logger(CampayService_1.name);
    get baseUrl() {
        return process.env.CAMPAY_BASE_URL ?? 'https://demo.campay.net/api';
    }
    get token() {
        return process.env.CAMPAY_PERMANENT_TOKEN ?? '';
    }
    get isMock() {
        return !this.token;
    }
    get isDemo() {
        return this.baseUrl.includes('demo.campay');
    }
    get headers() {
        return {
            Authorization: `Token ${this.token}`,
            'Content-Type': 'application/json',
        };
    }
    async collect(req) {
        if (this.isMock) {
            const reference = `MOCK-${(0, crypto_1.randomUUID)()}`;
            this.logger.warn(`[MOCK] collect ${req.externalReference} -> ${reference}`);
            return { reference, status: 'PENDING', operator: 'MOCK' };
        }
        const amount = this.isDemo ? '25' : req.amount;
        if (this.isDemo && amount !== req.amount) {
            this.logger.warn(`[DEMO] montant cape ${req.amount} -> ${amount} XAF`);
        }
        const { data } = await axios_1.default.post(`${this.baseUrl}/collect/`, {
            amount,
            currency: req.currency,
            from: req.phoneNumber,
            description: (req.description ?? 'Ebook credits').slice(0, 64),
            external_reference: req.externalReference,
        }, { headers: this.headers, timeout: 30000 });
        this.logger.log(`collect ${req.externalReference} -> ref ${data.reference}`);
        return {
            reference: data.reference,
            ussdCode: data.ussd_code,
            operator: data.operator,
            status: 'PENDING',
        };
    }
    async status(reference) {
        if (this.isMock || reference.startsWith('MOCK-')) {
            return { status: 'SUCCESSFUL' };
        }
        const { data } = await axios_1.default.get(`${this.baseUrl}/transaction/${reference}/`, {
            headers: this.headers,
            timeout: 30000,
        });
        return {
            status: this.mapStatus(data.status),
            failureReason: data.reason,
        };
    }
    mapStatus(s) {
        if (s === 'SUCCESSFUL')
            return 'SUCCESSFUL';
        if (s === 'FAILED')
            return 'FAILED';
        return 'PENDING';
    }
};
exports.CampayService = CampayService;
exports.CampayService = CampayService = CampayService_1 = __decorate([
    (0, common_1.Injectable)()
], CampayService);
//# sourceMappingURL=campay.service.js.map