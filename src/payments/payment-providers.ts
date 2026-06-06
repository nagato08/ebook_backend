export interface PaymentOperator {
  code: string; // identifiant interne
  displayName: string;
  country: string; // ISO3
  currency: string;
}

/**
 * Operateurs Mobile Money supportes par CamPay (Cameroun).
 * NB: CamPay detecte automatiquement l'operateur a partir du numero -- cette
 * liste est purement informative pour l'affichage cote front.
 */
export const CAMPAY_OPERATORS: PaymentOperator[] = [
  {
    code: 'MTN',
    displayName: 'MTN Mobile Money',
    country: 'CMR',
    currency: 'XAF',
  },
  {
    code: 'ORANGE',
    displayName: 'Orange Money',
    country: 'CMR',
    currency: 'XAF',
  },
];
