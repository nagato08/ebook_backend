import { VerifyCallback } from 'passport-google-oauth20';
interface GoogleProfile {
    id: string;
    displayName: string;
    emails: Array<{
        value: string;
    }>;
}
declare const GoogleStrategy_base: any;
export declare class GoogleStrategy extends GoogleStrategy_base {
    constructor();
    validate(accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback): any;
}
export {};
