import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AnalyzeNicheDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  keyword: string;

  @IsOptional()
  @IsString()
  geo?: string; // code pays (defaut CM)
}
