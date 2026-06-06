import { PaymentProvider, ProviderCollectRequest, ProviderCollectResult, ProviderStatusResult } from './payment-provider.interface';
export declare class CampayService implements PaymentProvider {
    readonly name = "campay";
    private readonly logger;
    private get baseUrl();
    private get token();
    get isMock(): boolean;
    private get isDemo();
    private get headers();
    collect(req: ProviderCollectRequest): Promise<ProviderCollectResult>;
    status(reference: string): Promise<ProviderStatusResult>;
    private mapStatus;
}
