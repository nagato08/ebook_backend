import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VerifiedEmailGuard } from '../common/guards/verified-email.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { GenerationService } from './generation.service';
import { GenerateBookDto } from '../books/dto/book.dto';

@Controller('books/:id')
@UseGuards(JwtAuthGuard)
export class GenerationController {
  constructor(private generation: GenerationService) {}

  @Post('generate')
  @UseGuards(VerifiedEmailGuard)
  generate(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: GenerateBookDto,
  ) {
    return this.generation.start(user.id, id, dto);
  }

  @Get('status')
  status(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.generation.status(user.id, id);
  }

  // Deblocage du livre (debite les credits). Pas de garde email: seule la
  // generation est gardee. Le paiement est gere via /payments.
  @Post('unlock')
  unlock(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.generation.unlock(user.id, id);
  }
}
