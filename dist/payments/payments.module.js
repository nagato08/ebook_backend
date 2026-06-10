"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const payments_controller_1 = require("./payments.controller");
const campay_service_1 = require("./campay.service");
const geniuspay_service_1 = require("./geniuspay.service");
const monetbil_service_1 = require("./monetbil.service");
const payment_provider_interface_1 = require("./payment-provider.interface");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        controllers: [payments_controller_1.PaymentsController],
        providers: [
            payments_service_1.PaymentsService,
            campay_service_1.CampayService,
            geniuspay_service_1.GeniusPayService,
            monetbil_service_1.MonetbilService,
            {
                provide: payment_provider_interface_1.PAYMENT_PROVIDER,
                useFactory: (campay, genius, monetbil) => {
                    const p = process.env.PAYMENT_PROVIDER;
                    if (p === 'campay')
                        return campay;
                    if (p === 'monetbil')
                        return monetbil;
                    return genius;
                },
                inject: [campay_service_1.CampayService, geniuspay_service_1.GeniusPayService, monetbil_service_1.MonetbilService],
            },
        ],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map