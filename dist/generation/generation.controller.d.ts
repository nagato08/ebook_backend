import type { AuthUser } from '../auth/current-user.decorator';
import { GenerationService } from './generation.service';
import { GenerateBookDto } from '../books/dto/book.dto';
export declare class GenerationController {
    private generation;
    constructor(generation: GenerationService);
    generate(user: AuthUser, id: string, dto: GenerateBookDto): unknown;
    status(user: AuthUser, id: string): unknown;
    unlock(user: AuthUser, id: string): unknown;
}
