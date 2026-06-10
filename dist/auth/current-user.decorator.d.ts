export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    credits: number;
    emailVerified: boolean;
    avatarUrl: string | null;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
