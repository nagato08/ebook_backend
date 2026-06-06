import { PrismaService } from '../prisma/prisma.service';
export type Level = 'low' | 'medium' | 'high';
export type Trend = 'rising' | 'stable' | 'declining';
export interface NicheAnalysis {
    keyword: string;
    geo: string;
    score: number;
    trend: Trend;
    demand: Level;
    competition: Level;
    summary: string;
    subNiches: {
        name: string;
        angle: string;
    }[];
    titles: string[];
    audience: string;
    monetization: string;
    source: 'ai-estimate' | 'trends';
    generatedAt: string;
}
export declare class NicheService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    analyze(keyword: string, geo?: string): Promise<NicheAnalysis>;
    private generate;
    private normalize;
    private mock;
}
