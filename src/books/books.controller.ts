import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateChapterDto } from './dto/book.dto';

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private books: BooksService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBookDto) {
    return this.books.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.books.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.books.findOne(user.id, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.books.remove(user.id, id);
  }

  @Patch(':id/chapters/:chapterId')
  updateChapter(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('chapterId') chapterId: string,
    @Body() dto: UpdateChapterDto,
  ) {
    return this.books.updateChapter(user.id, id, chapterId, dto);
  }
}
