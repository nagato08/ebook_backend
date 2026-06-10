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
    start(userId: string, bookId: string, dto: GenerateBookDto): Promise<{
        bookId: string;
        status: string;
    }>;
    unlock(userId: string, bookId: string): Promise<{
        bookId: string;
        unlocked: boolean;
        creditsSpent: number;
    }>;
    private wordsPerChapter;
    status(userId: string, bookId: string): Promise<{
        status: string;
        progress: number;
        chapters: number;
        coverUrl: string | null;
        unlocked: boolean;
    }>;
    private run;
    private callGenerator;
    private mock;
}
