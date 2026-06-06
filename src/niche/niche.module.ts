import { Module } from '@nestjs/common';
import { NicheService } from './niche.service';
import { NicheController } from './niche.controller';

@Module({
  controllers: [NicheController],
  providers: [NicheService],
})
export class NicheModule {}
