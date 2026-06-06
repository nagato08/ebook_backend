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
exports.CreditsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CreditsService = class CreditsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async balance(userId) {
        const u = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true },
        });
        return u?.credits ?? 0;
    }
    async ledger(userId) {
        const rows = await this.prisma.creditLedger.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        return rows.map((r) => ({ ...r, label: this.label(r.reason) }));
    }
    label(reason) {
        const [kind] = reason.split(':');
        switch (kind) {
            case 'signup_bonus':
                return 'Bonus de bienvenue';
            case 'unlock':
                return "Deblocage d'un livre";
            case 'purchase':
                return 'Achat de credits';
            case 'generation':
                return 'Generation';
            case 'refund':
                return 'Remboursement';
            default:
                return reason;
        }
    }
    async debit(userId, amount, reason) {
        return this.applyDelta(userId, -Math.abs(amount), reason);
    }
    async credit(userId, amount, reason) {
        return this.applyDelta(userId, Math.abs(amount), reason);
    }
    async applyDelta(userId, delta, reason) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { credits: true },
            });
            if (!user)
                throw new common_1.BadRequestException('Utilisateur introuvable');
            const balanceAfter = user.credits + delta;
            if (balanceAfter < 0) {
                throw new common_1.BadRequestException('Credits insuffisants');
            }
            await tx.user.update({
                where: { id: userId },
                data: { credits: balanceAfter },
            });
            await tx.creditLedger.create({
                data: { userId, delta, reason, balanceAfter },
            });
            return balanceAfter;
        });
    }
};
exports.CreditsService = CreditsService;
exports.CreditsService = CreditsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreditsService);
//# sourceMappingURL=credits.service.js.map