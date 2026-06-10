import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto, UpdateChapterDto } from './dto/book.dto';
export declare class BooksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateBookDto): import("@prisma/client").Prisma.Prisma__BookClient<{
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
    findAll(userId: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    findOne(userId: string, id: string): Promise<{
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
    remove(userId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    updateChapter(userId: string, bookId: string, chapterId: string, dto: UpdateChapterDto): Promise<{
        id: string;
        title: string;
        content: string | null;
        status: string;
        order: number;
        bookId: string;
    }>;
}
