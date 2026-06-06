import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NicheService } from './niche.service';
import { AnalyzeNicheDto } from './dto/niche.dto';

@Controller('niches')
@UseGuards(JwtAuthGuard)
export class NicheController {
  constructor(private niche: NicheService) {}

  @Post('analyze')
  analyze(@Body() dto: AnalyzeNicheDto) {
    return this.niche.analyze(dto.keyword, dto.geo ?? 'CM');
  }
}
