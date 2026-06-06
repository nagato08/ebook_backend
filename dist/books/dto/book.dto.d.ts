export declare class CreateBookDto {
    title: string;
    topic: string;
    audience?: string;
    tone?: string;
    language?: string;
    style?: string;
}
export declare class UpdateChapterDto {
    title?: string;
    content?: string;
}
export declare class GenerateBookDto {
    chapters?: number;
    pages?: number;
}
