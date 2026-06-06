import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

export type Level = 'low' | 'medium' | 'high';
export type Trend = 'rising' | 'stable' | 'declining';

export interface NicheAnalysis {
  keyword: string;
  geo: string;
  score: number; // 0-100 (demande vs concurrence)
  trend: Trend;
  demand: Level;
  competition: Level;
  summary: string;
  subNiches: { name: string; angle: string }[];
  titles: string[]; // titres d'ebook prets a generer
  audience: string;
  monetization: string;
  source: 'ai-estimate' | 'trends';
  generatedAt: string;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

@Injectable()
export class NicheService {
  private readonly logger = new Logger(NicheService.name);

  constructor(private prisma: PrismaService) {}

  async analyze(keyword: string, geo = 'CM'): Promise<NicheAnalysis> {
    const key = keyword.trim().toLowerCase();

    // 1. Cache frais (< 24h) ?
    const cached = await this.prisma.nicheQuery.findUnique({
      where: { keyword_geo: { keyword: key, geo } },
    });
    if (cached && Date.now() - cached.updatedAt.getTime() < CACHE_TTL_MS) {
      return JSON.parse(cached.result) as NicheAnalysis;
    }

    // 2. Generer (Groq direct, ou mock si pas de cle)
    const analysis = await this.generate(key, geo);

    // 3. Upsert cache
    await this.prisma.nicheQuery.upsert({
      where: { keyword_geo: { keyword: key, geo } },
      create: {
        keyword: key,
        geo,
        result: JSON.stringify(analysis),
        source: analysis.source,
      },
      update: {
        result: JSON.stringify(analysis),
        source: analysis.source,
      },
    });

    return analysis;
  }

  private async generate(keyword: string, geo: string): Promise<NicheAnalysis> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      this.logger.warn('[MOCK] GROQ_API_KEY absent -> analyse niche factice');
      return this.mock(keyword, geo);
    }

    const prompt = `Analyse la niche de marche pour des ebooks sur le sujet: "${keyword}" (marche: ${geo}).
Reponds en JSON strict avec EXACTEMENT ces cles:
{
  "score": <entier 0-100, demande vs concurrence>,
  "trend": "rising" | "stable" | "declining",
  "demand": "low" | "medium" | "high",
  "competition": "low" | "medium" | "high",
  "summary": "<2 phrases d'analyse en francais>",
  "subNiches": [{"name":"<sous-niche>","angle":"<angle d'attaque>"}, ... 3 a 5],
  "titles": ["<titre d'ebook accrocheur>", ... 5 titres],
  "audience": "<audience cible principale>",
  "monetization": "<1 phrase sur le potentiel de monetisation>"
}
Sois concret et oriente business. Reponds uniquement le JSON.`;

    try {
      const { data } = await axios.post<{
        choices: { message: { content: string } }[];
      }>(
        GROQ_URL,
        {
          model: MODEL,
          temperature: 0.7,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'Tu es un analyste de marche specialise dans l edition numerique (ebooks) en Afrique francophone.',
            },
            { role: 'user', content: prompt },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        },
      );

      const raw = data.choices?.[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw) as Partial<NicheAnalysis>;
      return this.normalize(keyword, geo, parsed, 'ai-estimate');
    } catch (e) {
      this.logger.error(`Analyse niche echec: ${String(e)} -> fallback mock`);
      return this.mock(keyword, geo);
    }
  }

  /** Garantit une forme complete meme si le LLM omet des champs. */
  private normalize(
    keyword: string,
    geo: string,
    p: Partial<NicheAnalysis>,
    source: NicheAnalysis['source'],
  ): NicheAnalysis {
    const clampScore = Math.max(0, Math.min(100, Number(p.score ?? 50)));
    return {
      keyword,
      geo,
      score: Number.isFinite(clampScore) ? clampScore : 50,
      trend: p.trend ?? 'stable',
      demand: p.demand ?? 'medium',
      competition: p.competition ?? 'medium',
      summary: p.summary ?? '',
      subNiches: Array.isArray(p.subNiches) ? p.subNiches.slice(0, 6) : [],
      titles: Array.isArray(p.titles) ? p.titles.slice(0, 8) : [],
      audience: p.audience ?? '',
      monetization: p.monetization ?? '',
      source,
      generatedAt: new Date().toISOString(),
    };
  }

  /** Analyse factice (sans cle Groq) pour developper le front. */
  private mock(keyword: string, geo: string): NicheAnalysis {
    return {
      keyword,
      geo,
      score: 62,
      trend: 'rising',
      demand: 'high',
      competition: 'medium',
      summary: `Niche "${keyword}" porteuse: demande en hausse, concurrence moderee. (Analyse factice - configurez GROQ_API_KEY.)`,
      subNiches: [
        { name: `${keyword} pour debutants`, angle: 'Initiation pas a pas' },
        { name: `${keyword} avance`, angle: 'Techniques expertes' },
        { name: `${keyword} au quotidien`, angle: 'Application pratique' },
      ],
      titles: [
        `Maitriser ${keyword} en 30 jours`,
        `${keyword}: le guide complet`,
        `Reussir avec ${keyword}`,
        `${keyword} pour les nuls`,
        `Les secrets de ${keyword}`,
      ],
      audience: 'Grand public francophone',
      monetization: 'Fort potentiel: sujet recherche, peu de contenu local.',
      source: 'ai-estimate',
      generatedAt: new Date().toISOString(),
    };
  }
}
