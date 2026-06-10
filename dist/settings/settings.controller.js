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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const settings_service_1 = require("./settings.service");
const is_admin_1 = require("../common/is-admin");
const maintenance_dto_1 = require("./dto/maintenance.dto");
let SettingsController = class SettingsController {
    settings;
    jwt;
    constructor(settings, jwt) {
        this.settings = settings;
        this.jwt = jwt;
    }
    async status(req) {
        return {
            maintenance: await this.settings.isMaintenance(),
            admin: (0, is_admin_1.isAdminRequest)(req, this.jwt),
        };
    }
    async toggle(user, dto) {
        if (user.email !== process.env.ADMIN_EMAIL) {
            throw new common_1.ForbiddenException("Reserve a l'administrateur");
        }
        await this.settings.setMaintenance(dto.on);
        return { maintenance: await this.settings.isMaintenance() };
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "status", null);
__decorate([
    (0, common_1.Post)('maintenance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, maintenance_dto_1.MaintenanceDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "toggle", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [settings_service_1.SettingsService,
        jwt_1.JwtService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map