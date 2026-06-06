import type { AuthUser } from '../auth/current-user.decorator';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateChapterDto } from './dto/book.dto';
export declare class BooksController {
    private books;
    constructor(books: BooksService);
    create(user: AuthUser, dto: CreateBookDto): any;
    findAll(user: AuthUser): any;
    findOne(user: AuthUser, id: string): unknown;
    remove(user: AuthUser, id: string): unknown;
    updateChapter(user: AuthUser, id: string, chapterId: string, dto: UpdateChapterDto): unknown;
}
