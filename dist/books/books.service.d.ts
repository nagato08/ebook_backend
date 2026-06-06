import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto, UpdateChapterDto } from './dto/book.dto';
export declare class BooksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateBookDto): any;
    findAll(userId: string): any;
    findOne(userId: string, id: string): unknown;
    remove(userId: string, id: string): unknown;
    updateChapter(userId: string, bookId: string, chapterId: string, dto: UpdateChapterDto): unknown;
}
