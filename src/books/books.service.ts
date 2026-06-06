import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto, UpdateChapterDto } from './dto/book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateBookDto) {
    return this.prisma.book.create({
      data: {
        userId,
        title: dto.title,
        topic: dto.topic,
        audience: dto.audience,
        tone: dto.tone,
        language: dto.language ?? 'fr',
        style: dto.style ?? 'Moderne',
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.book.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { chapters: true } } },
    });
  }

  async findOne(userId: string, id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { chapters: { orderBy: { order: 'asc' } } },
    });
    if (!book) throw new NotFoundException('Livre introuvable');
    if (book.userId !== userId) throw new ForbiddenException();

    // Freemium: tant que verrouille, seul le ch.1 expose son contenu.
    // Les autres chapitres gardent leur titre mais content = null (lock cote API).
    if (!book.unlocked) {
      book.chapters = book.chapters.map((c) =>
        c.order === 1 ? c : { ...c, content: null },
      );
    }
    return book;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.book.delete({ where: { id } });
    return { deleted: true };
  }

  async updateChapter(
    userId: string,
    bookId: string,
    chapterId: string,
    dto: UpdateChapterDto,
  ) {
    await this.findOne(userId, bookId); // verifie ownership
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
    });
    if (!chapter || chapter.bookId !== bookId) {
      throw new NotFoundException('Chapitre introuvable');
    }
    return this.prisma.chapter.update({
      where: { id: chapterId },
      data: { title: dto.title, content: dto.content },
    });
  }
}
