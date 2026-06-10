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
var MaintenanceGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const settings_service_1 = require("../../settings/settings.service");
const is_admin_1 = require("../is-admin");
let MaintenanceGuard = class MaintenanceGuard {
    static { MaintenanceGuard_1 = this; }
    settings;
    jwt;
    static WHITELIST = new Set([
        'GET /status',
        'POST /auth/login',
        'GET /auth/google',
        'GET /auth/google/callback',
        'POST /payments/callback',
        'POST /maintenance',
    ]);
    constructor(settings, jwt) {
        this.settings = settings;
        this.jwt = jwt;
    }
    async canActivate(ctx) {
        const req = ctx.switchToHttp().getRequest();
        if (!(await this.settings.isMaintenance()))
            return true;
        const path = (req.path || req.url.split('?')[0]).replace(/\/+$/, '') || '/';
        if (MaintenanceGuard_1.WHITELIST.has(`${req.method} ${path}`))
            return true;
        if ((0, is_admin_1.isAdminRequest)(req, this.jwt))
            return true;
        throw new common_1.ServiceUnavailableException({
            maintenance: true,
            message: 'Site en maintenance. Reviens dans un moment.',
        });
    }
};
exports.MaintenanceGuard = MaintenanceGuard;
exports.MaintenanceGuard = MaintenanceGuard = MaintenanceGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [settings_service_1.SettingsService,
        jwt_1.JwtService])
], MaintenanceGuard);
//# sourceMappingURL=maintenance.guard.js.map