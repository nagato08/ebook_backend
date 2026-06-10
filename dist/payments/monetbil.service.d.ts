import { PaymentProvider, ProviderCollectRequest, ProviderCollectResult, ProviderStatusResult } from './payment-provider.interface';
export declare class MonetbilService implements PaymentProvider {
    readonly name = "monetbil";
    private readonly logger;
    private get serviceKey();
    private get serviceSecret();
    get isMock(): boolean;
    collect(req: ProviderCollectRequest): Promise<ProviderCollectResult>;
    status(reference: string): Promise<ProviderStatusResult>;
}
