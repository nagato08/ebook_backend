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
exports.BooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BooksService = class BooksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(userId, dto) {
        return this.prisma.book.create({
            data: {
                userId,
                title: dto.title,
                topic: dto.topic,
                audience: dto.audience,
                tone: dto.tone,
                language: dto.language ?? 'fr',
                style: dto.style ?? 'Moderne',
            },
        });
    }
    findAll(userId) {
        return this.prisma.book.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { chapters: true } } },
        });
    }
    async findOne(userId, id) {
        const book = await this.prisma.book.findUnique({
            where: { id },
            include: { chapters: { orderBy: { order: 'asc' } } },
        });
        if (!book)
            throw new common_1.NotFoundException('Livre introuvable');
        if (book.userId !== userId)
            throw new common_1.ForbiddenException();
        if (!book.unlocked) {
            book.chapters = book.chapters.map((c) => c.order === 1 ? c : { ...c, content: null });
        }
        return book;
    }
    async remove(userId, id) {
        await this.findOne(userId, id);
        await this.prisma.book.delete({ where: { id } });
        return { deleted: true };
    }
    async updateChapter(userId, bookId, chapterId, dto) {
        await this.findOne(userId, bookId);
        const chapter = await this.prisma.chapter.findUnique({
            where: { id: chapterId },
        });
        if (!chapter || chapter.bookId !== bookId) {
            throw new common_1.NotFoundException('Chapitre introuvable');
        }
        return this.prisma.chapter.update({
            where: { id: chapterId },
            data: { title: dto.title, content: dto.content },
        });
    }
};
exports.BooksService = BooksService;
exports.BooksService = BooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BooksService);
//# sourceMappingURL=books.service.js.map