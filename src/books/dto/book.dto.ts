import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  topic: string;

  @IsOptional()
  @IsString()
  audience?: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  style?: string;
}

export class UpdateChapterDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;
}

export class GenerateBookDto {
  // Nombre de chapitres souhaite (le plan reste pilote par la generation)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  chapters?: number;

  // Nombre de pages cible. Pilote la longueur de chaque chapitre.
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(200)
  pages?: number;
}
