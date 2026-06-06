import { Module } from '@nestjs/common';
import { BooksModule } from '../books/books.module';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';

@Module({
  imports: [BooksModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
