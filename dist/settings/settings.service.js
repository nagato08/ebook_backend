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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsService = class SettingsService {
    prisma;
    cache = new Map();
    TTL_MS = 5000;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get(key) {
        const cached = this.cache.get(key);
        if (cached && cached.exp > Date.now())
            return cached.value;
        const row = await this.prisma.setting.findUnique({ where: { key } });
        if (row) {
            this.cache.set(key, { value: row.value, exp: Date.now() + this.TTL_MS });
            return row.value;
        }
        this.cache.delete(key);
        return null;
    }
    async set(key, value) {
        await this.prisma.setting.upsert({
            where: { key },
            create: { key, value },
            update: { value },
        });
        this.cache.set(key, { value, exp: Date.now() + this.TTL_MS });
    }
    async isMaintenance() {
        return (await this.get('maintenance')) === 'on';
    }
    async setMaintenance(on) {
        await this.set('maintenance', on ? 'on' : 'off');
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map