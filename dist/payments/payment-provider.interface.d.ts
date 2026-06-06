export type ProviderStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED';
export interface ProviderCollectRequest {
    amount: string;
    currency: string;
    phoneNumber: string;
    externalReference: string;
    description?: string;
    customerName?: string;
    customerEmail?: string;
}
export interface ProviderCollectResult {
    reference: string;
    status: ProviderStatus;
    operator?: string;
    ussdCode?: string;
    checkoutUrl?: string;
}
export interface ProviderStatusResult {
    status: ProviderStatus;
    failureReason?: string;
}
export interface PaymentProvider {
    readonly name: string;
    readonly isMock: boolean;
    collect(req: ProviderCollectRequest): Promise<ProviderCollectResult>;
    status(reference: string): Promise<ProviderStatusResult>;
}
export declare const PAYMENT_PROVIDER = "PAYMENT_PROVIDER";
