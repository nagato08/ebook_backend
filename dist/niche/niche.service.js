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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var NicheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NicheService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const prisma_service_1 = require("../prisma/prisma.service");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
let NicheService = NicheService_1 = class NicheService {
    prisma;
    logger = new common_1.Logger(NicheService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async analyze(keyword, geo = 'CM') {
        const key = keyword.trim().toLowerCase();
        const cached = await this.prisma.nicheQuery.findUnique({
            where: { keyword_geo: { keyword: key, geo } },
        });
        if (cached && Date.now() - cached.updatedAt.getTime() < CACHE_TTL_MS) {
            return JSON.parse(cached.result);
        }
        const analysis = await this.generate(key, geo);
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
    async generate(keyword, geo) {
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
            const { data } = await axios_1.default.post(GROQ_URL, {
                model: MODEL,
                temperature: 0.7,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: 'Tu es un analyste de marche specialise dans l edition numerique (ebooks) en Afrique francophone.',
                    },
                    { role: 'user', content: prompt },
                ],
            }, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            });
            const raw = data.choices?.[0]?.message?.content ?? '{}';
            const parsed = JSON.parse(raw);
            return this.normalize(keyword, geo, parsed, 'ai-estimate');
        }
        catch (e) {
            this.logger.error(`Analyse niche echec: ${String(e)} -> fallback mock`);
            return this.mock(keyword, geo);
        }
    }
    normalize(keyword, geo, p, source) {
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
    mock(keyword, geo) {
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
};
exports.NicheService = NicheService;
exports.NicheService = NicheService = NicheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NicheService);
//# sourceMappingURL=niche.service.js.map