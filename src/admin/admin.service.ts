import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';

const SUCCESS = 'SUCCESSFUL';
const PENDING = 'PENDING';

/**
 * Lecture/monitoring pour le panel admin. Lit les tables existantes
 * (User, Book, Payment, CreditLedger, NicheQuery) — pas d'audit log dédié.
 */
@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private payments: PaymentsService,
  ) {}

  /** Chiffres clés du tableau de bord. */
  async stats() {
    const [
      users,
      books,
      booksReady,
      paymentsPending,
      paymentsSuccess,
      successRows,
      niches,
    ] = await Promise.all([
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

    // amount est une string entière (XAF) -> somme numérique.
    const revenue = successRows.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      users,
      books,
      booksReady,
      payments: { pending: paymentsPending, successful: paymentsSuccess },
      revenue, // XAF
      niches,
    };
  }

  /** Liste paginée des users + compteurs (recherche email/nom). */
  async users(opts: { search?: string; skip?: number; take?: number }) {
    const take = Math.min(opts.take ?? 30, 100);
    const skip = opts.skip ?? 0;
    const where = opts.search
      ? {
          OR: [
            { email: { contains: opts.search, mode: 'insensitive' as const } },
            { name: { contains: opts.search, mode: 'insensitive' as const } },
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

  /** Détail d'un user + activité (livres, paiements, mouvements de crédits). */
  async user(id: string) {
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
    if (!user) throw new NotFoundException('Utilisateur introuvable');

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

  /** Liste des paiements (filtre statut/provider), avec l'user. */
  async paymentsList(opts: {
    status?: string;
    provider?: string;
    take?: number;
  }) {
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

  /** Validation/refus d'un paiement (manuel) -> délègue à PaymentsService. */
  approve(paymentId: string) {
    return this.payments.adminApprove(paymentId);
  }
  reject(paymentId: string, reason?: string) {
    return this.payments.adminReject(paymentId, reason);
  }
}
