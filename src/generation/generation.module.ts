import { Module } from '@nestjs/common';
import { GenerationService } from './generation.service';
import { GenerationController } from './generation.controller';
import { BooksModule } from '../books/books.module';

@Module({
  imports: [BooksModule],
  controllers: [GenerationController],
  providers: [GenerationService],
})
export class GenerationModule {}
