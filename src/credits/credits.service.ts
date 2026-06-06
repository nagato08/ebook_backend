import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CreditsService {
  constructor(private prisma: PrismaService) {}

  async balance(userId: string): Promise<number> {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    return u?.credits ?? 0;
  }

  async ledger(userId: string) {
    const rows = await this.prisma.creditLedger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    // Ajoute un libelle lisible sans modifier la cle machine `reason`.
    return rows.map((r) => ({ ...r, label: this.label(r.reason) }));
  }

  /** Traduit le code `reason` (cle machine) en libelle francais affichable. */
  private label(reason: string): string {
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

  /**
   * Debite des credits de maniere atomique. Leve si solde insuffisant.
   */
  async debit(userId: string, amount: number, reason: string) {
    return this.applyDelta(userId, -Math.abs(amount), reason);
  }

  /**
   * Credite des credits (achat pawaPay, bonus...).
   */
  async credit(userId: string, amount: number, reason: string) {
    return this.applyDelta(userId, Math.abs(amount), reason);
  }

  private async applyDelta(userId: string, delta: number, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });
      if (!user) throw new BadRequestException('Utilisateur introuvable');

      const balanceAfter = user.credits + delta;
      if (balanceAfter < 0) {
        throw new BadRequestException('Credits insuffisants');
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
}
