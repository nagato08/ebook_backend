import type { AuthUser } from '../auth/current-user.decorator';
import { GenerationService } from './generation.service';
import { GenerateBookDto } from '../books/dto/book.dto';
export declare class GenerationController {
    private generation;
    constructor(generation: GenerationService);
    generate(user: AuthUser, id: string, dto: GenerateBookDto): Promise<{
        bookId: string;
        status: string;
    }>;
    status(user: AuthUser, id: string): Promise<{
        status: string;
        progress: number;
        chapters: number;
        coverUrl: string | null;
        unlocked: boolean;
    }>;
    unlock(user: AuthUser, id: string): Promise<{
        bookId: string;
        unlocked: boolean;
        creditsSpent: number;
    }>;
}
