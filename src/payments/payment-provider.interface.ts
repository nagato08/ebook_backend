// Abstraction commune aux providers de paiement (CamPay, GeniusPay...).
// Permet de switcher de provider via la variable d'env PAYMENT_PROVIDER.

export type ProviderStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED';

export interface ProviderCollectRequest {
  amount: string; // entier en string (XAF sans decimales)
  currency: string;
  phoneNumber: string; // 237XXXXXXXXX
  externalReference: string; // notre Payment.depositId
  description?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface ProviderCollectResult {
  reference: string; // reference generee par le provider (-> Payment.providerRef)
  status: ProviderStatus;
  operator?: string;
  ussdCode?: string; // CamPay (paiement par prompt PIN)
  checkoutUrl?: string; // GeniusPay (redirection vers page de paiement)
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

// Token d'injection NestJS pour le provider actif.
export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';
