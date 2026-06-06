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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const payments_service_1 = require("./payments.service");
const payment_dto_1 = require("./dto/payment.dto");
let PaymentsController = class PaymentsController {
    payments;
    constructor(payments) {
        this.payments = payments;
    }
    packs() {
        return this.payments.packs();
    }
    providers() {
        return this.payments.providers();
    }
    deposit(user, dto) {
        return this.payments.initiate(user.id, dto);
    }
    callback(req, body, signature, timestamp) {
        this.payments.verifyWebhook(signature, timestamp, req.rawBody?.toString('utf8'));
        return this.payments.handleCallback(body);
    }
    status(user, depositId) {
        return this.payments.checkAndSync(user.id, depositId);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)('packs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "packs", null);
__decorate([
    (0, common_1.Get)('providers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "providers", null);
__decorate([
    (0, common_1.Post)('deposit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.InitiateDepositDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "deposit", null);
__decorate([
    (0, common_1.Post)('callback'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-webhook-signature')),
    __param(3, (0, common_1.Headers)('x-webhook-timestamp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object, String, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "callback", null);
__decorate([
    (0, common_1.Get)('deposit/:depositId/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('depositId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "status", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map