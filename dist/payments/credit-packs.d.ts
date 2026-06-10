export interface CreditPack {
    id: string;
    label: string;
    credits: number;
    amount: string;
    currency: string;
}
export declare const CREDIT_PACKS: CreditPack[];
export declare const findPack: (id: string) => CreditPack | undefined;
