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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualPaymentDto = exports.InitiateDepositDto = void 0;
const class_validator_1 = require("class-validator");
class InitiateDepositDto {
    packId;
    phoneNumber;
    currency;
}
exports.InitiateDepositDto = InitiateDepositDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiateDepositDto.prototype, "packId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiateDepositDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiateDepositDto.prototype, "currency", void 0);
class ManualPaymentDto {
    packId;
    senderPhone;
    txId;
}
exports.ManualPaymentDto = ManualPaymentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ManualPaymentDto.prototype, "packId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ManualPaymentDto.prototype, "senderPhone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ManualPaymentDto.prototype, "txId", void 0);
//# sourceMappingURL=payment.dto.js.map