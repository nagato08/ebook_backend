import { BooksService } from '../books/books.service';
export declare class ExportService {
    private books;
    constructor(books: BooksService);
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
