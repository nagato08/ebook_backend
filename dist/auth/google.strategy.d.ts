import { Strategy, VerifyCallback, StrategyOptions } from 'passport-google-oauth20';
interface GoogleProfile {
    id: string;
    displayName: string;
    emails: Array<{
        value: string;
    }>;
}
declare const GoogleStrategy_base: new (...args: [options: import("passport-google-oauth20").StrategyOptionsWithRequest] | [options: StrategyOptions] | [options: StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class GoogleStrategy extends GoogleStrategy_base {
    constructor();
    validate(accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback): Promise<void>;
}
export {};
