import { IsOptional, IsString } from 'class-validator';

export class InitiateDepositDto {
  @IsString()
  packId: string; // discovery | creator | pro | business

  @IsString()
  phoneNumber: string; // format 237XXXXXXXXX (CamPay detecte l'operateur)

  @IsOptional()
  @IsString()
  currency?: string; // surcharge devise du pack si besoin (defaut XAF)
}
