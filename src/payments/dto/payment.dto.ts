import { IsOptional, IsString } from 'class-validator';

export class InitiateDepositDto {
  @IsString()
  packId: string; // discovery | creator | pro | business

  // Optionnel: GeniusPay (checkout hebergé) demande le numero sur sa page.
  // Si fourni, sert de pre-remplissage. Format 237XXXXXXXXX.
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  currency?: string; // surcharge devise du pack si besoin (defaut XAF)
}

export class ManualPaymentDto {
  @IsString()
  packId: string;

  @IsString()
  senderPhone: string; // numero MoMo qui a effectue le paiement

  @IsString()
  txId: string; // ID de transaction MoMo (preuve)
}
