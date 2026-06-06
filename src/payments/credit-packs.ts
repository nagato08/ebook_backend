// Packs de credits (modele Bookzy). Prix par defaut en XAF (FCFA Cameroun).
// La devise/provider peuvent etre surcharges a l'achat selon le pays.
export interface CreditPack {
  id: string;
  label: string;
  credits: number;
  amount: string; // string entiere (XAF sans decimales)
  currency: string;
}

// 1 ebook = 20 credits. Prix/credit degressif: 75 -> 70 -> 64 -> 58 FCFA.
export const CREDIT_PACKS: CreditPack[] = [
  // TEST: pack a retirer apres validation du paiement live.
  { id: 'test', label: 'Test', credits: 100, amount: '50', currency: 'XAF' },
  {
    id: 'discovery',
    label: 'Decouverte',
    credits: 140,
    amount: '10500',
    currency: 'XAF',
  },
  {
    id: 'creator',
    label: 'Createur',
    credits: 320,
    amount: '22500',
    currency: 'XAF',
  },
  { id: 'pro', label: 'Pro', credits: 700, amount: '45000', currency: 'XAF' },
  {
    id: 'business',
    label: 'Business',
    credits: 2000,
    amount: '116000',
    currency: 'XAF',
  },
];

export const findPack = (id: string) => CREDIT_PACKS.find((p) => p.id === id);
