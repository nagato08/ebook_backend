import type { AuthUser } from '../auth/current-user.decorator';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateChapterDto } from './dto/book.dto';
export declare class BooksController {
    private books;
    constructor(books: BooksService);
    create(user: AuthUser, dto: CreateBookDto): import("@prisma/client").Prisma.Prisma__BookClient<{
        id: string;
        createdAt: Date;
        userId: string;
        audience: string | null;
        title: string;
        topic: string;
        tone: string | null;
        language: string;
        style: string;
        status: string;
        unlocked: boolean;
        coverUrl: string | null;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(user: AuthUser): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            chapters: number;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        audience: string | null;
        title: string;
        topic: string;
        tone: string | null;
        language: string;
        style: string;
        status: string;
        unlocked: boolean;
        coverUrl: string | null;
        updatedAt: Date;
    })[]>;
    findOne(user: AuthUser, id: string): Promise<{
        chapters: {
            id: string;
            title: string;
            content: string | null;
            status: string;
            order: number;
            bookId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        audience: string | null;
        title: string;
        topic: string;
        tone: string | null;
        language: string;
        style: string;
        status: string;
        unlocked: boolean;
        coverUrl: string | null;
        updatedAt: Date;
    }>;
    remove(user: AuthUser, id: string): Promise<{
        deleted: boolean;
    }>;
    updateChapter(user: AuthUser, id: string, chapterId: string, dto: UpdateChapterDto): Promise<{
        id: string;
        title: string;
        content: string | null;
        status: string;
        order: number;
        bookId: string;
    }>;
}
