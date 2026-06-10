import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    private cache;
    private readonly TTL_MS;
    constructor(prisma: PrismaService);
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    isMaintenance(): Promise<boolean>;
    setMaintenance(on: boolean): Promise<void>;
}
