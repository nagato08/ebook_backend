export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}
export declare class EmailService {
    private resend;
    constructor();
    generateToken(): string;
    send(payload: EmailPayload): Promise<void>;
    sendVerificationEmail(email: string, token: string, frontendUrl: string): Promise<void>;
    sendWelcomeEmail(email: string, name: string): Promise<void>;
}
