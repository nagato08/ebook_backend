"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const credits_module_1 = require("./credits/credits.module");
const books_module_1 = require("./books/books.module");
const generation_module_1 = require("./generation/generation.module");
const payments_module_1 = require("./payments/payments.module");
const export_module_1 = require("./export/export.module");
const niche_module_1 = require("./niche/niche.module");
const settings_module_1 = require("./settings/settings.module");
const maintenance_guard_1 = require("./common/guards/maintenance.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET ?? 'change-me-in-prod-super-secret',
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            credits_module_1.CreditsModule,
            books_module_1.BooksModule,
            generation_module_1.GenerationModule,
            payments_module_1.PaymentsModule,
            export_module_1.ExportModule,
            niche_module_1.NicheModule,
            settings_module_1.SettingsModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: maintenance_guard_1.MaintenanceGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map