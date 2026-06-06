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
var GenerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const prisma_service_1 = require("../prisma/prisma.service");
const credits_service_1 = require("../credits/credits.service");
const books_service_1 = require("../books/books.service");
const WORDS_PER_PAGE = 275;
const DEFAULT_WORDS_PER_CHAPTER = 750;
const MIN_WORDS = 300;
const MAX_WORDS = 2500;
const MAX_LOCKED_BOOKS = Number(process.env.MAX_LOCKED_BOOKS ?? 2);
let GenerationService = GenerationService_1 = class GenerationService {
    prisma;
    credits;
    books;
    logger = new common_1.Logger(GenerationService_1.name);
    unlockCost = Number(process.env.UNLOCK_COST_CREDITS ??
        process.env.GENERATION_COST_CREDITS ??
        20);
    constructor(prisma, credits, books) {
        this.prisma = prisma;
        this.credits = credits;
        this.books = books;
    }
    async start(userId, bookId, dto) {
        const book = await this.books.findOne(userId, bookId);
        if (book.status === 'GENERATING') {
            throw new common_1.BadRequestException('Generation deja en cours');
        }
        const lockedCount = await this.prisma.book.count({
            where: {
                userId,
                unlocked: false,
                status: { in: ['READY', 'GENERATING'] },
                id: { not: bookId },
            },
        });
        if (lockedCount >= MAX_LOCKED_BOOKS) {
            throw new common_1.BadRequestException(`Limite atteinte: ${MAX_LOCKED_BOOKS} livres non debloques. Debloquez-en un pour en generer un nouveau.`);
        }
        await this.prisma.book.update({
            where: { id: bookId },
            data: { status: 'GENERATING', unlocked: false },
        });
        const chapters = dto.chapters ?? 8;
        const wordsPerChapter = this.wordsPerChapter(dto.pages, chapters);
        void this.run(bookId, chapters, wordsPerChapter);
        return { bookId, status: 'GENERATING' };
    }
    async unlock(userId, bookId) {
        const book = await this.books.findOne(userId, bookId);
        if (book.unlocked) {
            return { bookId, unlocked: true, creditsSpent: 0 };
        }
        if (book.status !== 'READY') {
            throw new common_1.BadRequestException('Le livre doit etre genere avant le deblocage');
        }
        await this.credits.debit(userId, this.unlockCost, `unlock:${bookId}`);
        await this.prisma.book.update({
            where: { id: bookId },
            data: { unlocked: true },
        });
        return { bookId, unlocked: true, creditsSpent: this.unlockCost };
    }
    wordsPerChapter(pages, chapters) {
        if (!pages)
            return DEFAULT_WORDS_PER_CHAPTER;
        const total = pages * WORDS_PER_PAGE;
        const per = Math.round(total / chapters);
        return Math.min(MAX_WORDS, Math.max(MIN_WORDS, per));
    }
    async status(userId, bookId) {
        const book = await this.books.findOne(userId, bookId);
        const done = book.chapters.filter((c) => c.status === 'DONE').length;
        return {
            status: book.status,
            progress: book.chapters.length
                ? Math.round((done / book.chapters.length) * 100)
                : 0,
            chapters: book.chapters.length,
            coverUrl: book.coverUrl,
            unlocked: book.unlocked,
        };
    }
    async run(bookId, nbChapters, wordsPerChapter) {
        try {
            const book = await this.prisma.book.findUniqueOrThrow({
                where: { id: bookId },
            });
            const result = await this.callGenerator(book, nbChapters, wordsPerChapter);
            await this.prisma.chapter.deleteMany({ where: { bookId } });
            await this.prisma.chapter.createMany({
                data: result.chapters.map((c) => ({
                    bookId,
                    order: c.order,
                    title: c.title,
                    content: c.content,
                    status: 'DONE',
                })),
            });
            await this.prisma.book.update({
                where: { id: bookId },
                data: { status: 'READY', coverUrl: result.coverUrl },
            });
            this.logger.log(`Book ${bookId} genere (${result.chapters.length} ch.)`);
        }
        catch (e) {
            this.logger.error(`Echec generation ${bookId}: ${e}`);
            await this.prisma.book.update({
                where: { id: bookId },
                data: { status: 'FAILED' },
            });
        }
    }
    async callGenerator(book, nbChapters, wordsPerChapter) {
        const url = process.env.N8N_WEBHOOK_URL;
        if (!url) {
            return this.mock(book, nbChapters);
        }
        const { data } = await axios_1.default.post(url, {
            bookId: book.id,
            title: book.title,
            topic: book.topic,
            audience: book.audience,
            tone: book.tone,
            language: book.language,
            style: book.style,
            chapters: nbChapters,
            wordsPerChapter,
        }, {
            headers: process.env.N8N_WEBHOOK_TOKEN
                ? { Authorization: `Bearer ${process.env.N8N_WEBHOOK_TOKEN}` }
                : undefined,
            timeout: 1000 * 60 * 10,
        });
        if (!data?.chapters?.length) {
            throw new Error('Reponse n8n invalide (chapters manquants)');
        }
        return data;
    }
    mock(book, nbChapters) {
        const chapters = Array.from({ length: nbChapters }, (_, i) => ({
            order: i + 1,
            title: `Chapitre ${i + 1} — ${book.topic}`,
            content: `Contenu mock du chapitre ${i + 1} pour « ${book.title} ».\n\n` +
                `Configure N8N_WEBHOOK_URL pour brancher la vraie generation IA.`,
        }));
        return { coverUrl: undefined, chapters };
    }
};
exports.GenerationService = GenerationService;
exports.GenerationService = GenerationService = GenerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        credits_service_1.CreditsService,
        books_service_1.BooksService])
], GenerationService);
//# sourceMappingURL=generation.service.js.map