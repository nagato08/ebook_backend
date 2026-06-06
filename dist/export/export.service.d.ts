import { BooksService } from '../books/books.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ExportService {
    private books;
    private prisma;
    constructor(books: BooksService, prisma: PrismaService);
    private load;
    private slug;
    private renderHtml;
    private escape;
    toPdf(userId: string, bookId: string): Promise<{
        buffer: Buffer;
        filename: string;
    }>;
    toEpub(userId: string, bookId: string): Promise<{
        buffer: Buffer;
        filename: string;
    }>;
}
