import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Réglages globaux clé/valeur (table Setting). Cache mémoire court (5s) pour
 * éviter un hit DB à chaque requête (le guard maintenance lit `maintenance`
 * sur CHAQUE requête). Invalidé immédiatement à l'écriture.
 */
@Injectable()
export class SettingsService {
  private cache = new Map<string, { value: string; exp: number }>();
  private readonly TTL_MS = 5000;

  constructor(private prisma: PrismaService) {}

  async get(key: string): Promise<string | null> {
    const cached = this.cache.get(key);
    if (cached && cached.exp > Date.now()) return cached.value;

    const row = await this.prisma.setting.findUnique({ where: { key } });
    if (row) {
      this.cache.set(key, { value: row.value, exp: Date.now() + this.TTL_MS });
      return row.value;
    }
    this.cache.delete(key);
    return null;
  }

  async set(key: string, value: string): Promise<void> {
    await this.prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    this.cache.set(key, { value, exp: Date.now() + this.TTL_MS });
  }

  async isMaintenance(): Promise<boolean> {
    return (await this.get('maintenance')) === 'on';
  }

  async setMaintenance(on: boolean): Promise<void> {
    await this.set('maintenance', on ? 'on' : 'off');
  }
}
