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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const payments_service_1 = require("../payments/payments.service");
const SUCCESS = 'SUCCESSFUL';
const PENDING = 'PENDING';
let AdminService = class AdminService {
    prisma;
    payments;
    constructor(prisma, payments) {
        this.prisma = prisma;
        this.payments = payments;
    }
    async stats() {
        const [users, books, booksReady, paymentsPending, paymentsSuccess, successRows, niches,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.book.count(),
            this.prisma.book.count({ where: { status: 'READY' } }),
            this.prisma.payment.count({ where: { status: PENDING } }),
            this.prisma.payment.count({ where: { status: SUCCESS } }),
            this.prisma.payment.findMany({
                where: { status: SUCCESS },
                select: { amount: true },
            }),
            this.prisma.nicheQuery.count(),
        ]);
        const revenue = successRows.reduce((sum, p) => sum + Number(p.amount), 0);
        return {
            users,
            books,
            booksReady,
            payments: { pending: paymentsPending, successful: paymentsSuccess },
            revenue,
            niches,
        };
    }
    async users(opts) {
        const take = Math.min(opts.take ?? 30, 100);
        const skip = opts.skip ?? 0;
        const where = opts.search
            ? {
                OR: [
                    { email: { contains: opts.search, mode: 'insensitive' } },
                    { name: { contains: opts.search, mode: 'insensitive' } },
                ],
            }
            : {};
        const [total, items] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    credits: true,
                    emailVerified: true,
                    createdAt: true,
                    _count: { select: { books: true, payments: true } },
                },
            }),
        ]);
        return { total, skip, take, items };
    }
    async user(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                credits: true,
                emailVerified: true,
                avatarUrl: true,
                createdAt: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        const [books, payments, ledger] = await Promise.all([
            this.prisma.book.findMany({
                where: { userId: id },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    unlocked: true,
                    createdAt: true,
                },
            }),
            this.prisma.payment.findMany({
                where: { userId: id },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    amount: true,
                    currency: true,
                    status: true,
                    provider: true,
                    creditsPack: true,
                    providerRef: true,
                    phoneNumber: true,
                    createdAt: true,
                },
            }),
            this.prisma.creditLedger.findMany({
                where: { userId: id },
                orderBy: { createdAt: 'desc' },
                take: 50,
                select: {
                    id: true,
                    delta: true,
                    reason: true,
                    balanceAfter: true,
                    createdAt: true,
                },
            }),
        ]);
        return { user, books, payments, ledger };
    }
    async paymentsList(opts) {
        const take = Math.min(opts.take ?? 50, 200);
        return this.prisma.payment.findMany({
            where: {
                ...(opts.status ? { status: opts.status } : {}),
                ...(opts.provider ? { provider: opts.provider } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take,
            select: {
                id: true,
                amount: true,
                currency: true,
                status: true,
                provider: true,
                creditsPack: true,
                providerRef: true,
                phoneNumber: true,
                failureReason: true,
                createdAt: true,
                user: { select: { id: true, email: true, name: true } },
            },
        });
    }
    approve(paymentId) {
        return this.payments.adminApprove(paymentId);
    }
    reject(paymentId, reason) {
        return this.payments.adminReject(paymentId, reason);
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payments_service_1.PaymentsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map