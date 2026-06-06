import { PaymentProvider, ProviderCollectRequest, ProviderCollectResult, ProviderStatusResult } from './payment-provider.interface';
export declare class GeniusPayService implements PaymentProvider {
    readonly name = "geniuspay";
    private readonly logger;
    private get baseUrl();
    private get apiKey();
    private get apiSecret();
    get isMock(): boolean;
    private get headers();
    collect(req: ProviderCollectRequest): Promise<ProviderCollectResult>;
    status(reference: string): Promise<ProviderStatusResult>;
    private mapStatus;
}
