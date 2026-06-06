import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { BooksService } from '../books/books.service';
import { GenerateBookDto } from '../books/dto/book.dto';
export declare class GenerationService {
    private prisma;
    private credits;
    private books;
    private readonly logger;
    private readonly unlockCost;
    constructor(prisma: PrismaService, credits: CreditsService, books: BooksService);
    start(userId: string, bookId: string, dto: GenerateBookDto): unknown;
    unlock(userId: string, bookId: string): unknown;
    private wordsPerChapter;
    status(userId: string, bookId: string): unknown;
    private run;
    private callGenerator;
    private mock;
}
