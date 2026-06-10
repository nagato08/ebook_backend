import { IsBoolean } from 'class-validator';

export class MaintenanceDto {
  @IsBoolean()
  on: boolean;
}
