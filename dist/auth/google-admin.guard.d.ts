declare const GoogleAdminGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GoogleAdminGuard extends GoogleAdminGuard_base {
    getAuthenticateOptions(): {
        state: string;
    };
}
export {};
