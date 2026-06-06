import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { BooksService } from '../books/books.service';
import { GenerateBookDto } from '../books/dto/book.dto';

interface GeneratedChapter {
  order: number;
  title: string;
  content: string;
}
interface GenerationResult {
  coverUrl?: string;
  chapters: GeneratedChapter[];
}

// Mots par page (format ebook standard) pour traduire pages -> longueur chapitre.
const WORDS_PER_PAGE = 275;
const DEFAULT_WORDS_PER_CHAPTER = 750;
const MIN_WORDS = 300;
const MAX_WORDS = 2500; // borne haute pour rester sous la limite de tokens Groq
// Anti-abus: nb max de livres generes mais non debloques par utilisateur.
const MAX_LOCKED_BOOKS = Number(process.env.MAX_LOCKED_BOOKS ?? 2);

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);
  // Freemium: la generation est gratuite, c'est le DEBLOCAGE qui coute.
  private readonly unlockCost = Number(
    process.env.UNLOCK_COST_CREDITS ??
      process.env.GENERATION_COST_CREDITS ??
      20,
  );

  constructor(
    private prisma: PrismaService,
    private credits: CreditsService,
    private books: BooksService,
  ) {}

  /**
   * Lance la generation (GRATUITE). Passe le livre en GENERATING + le (re)verrouille,
   * puis declenche le traitement asynchrone. Retourne immediatement.
   * Le cout est preleve plus tard, au deblocage (unlock).
   */
  async start(userId: string, bookId: string, dto: GenerateBookDto) {
    const book = await this.books.findOne(userId, bookId); // verifie ownership

    if (book.status === 'GENERATING') {
      throw new BadRequestException('Generation deja en cours');
    }

    // Anti-abus: max N livres generes non debloques (hors le livre courant).
    const lockedCount = await this.prisma.book.count({
      where: {
        userId,
        unlocked: false,
        status: { in: ['READY', 'GENERATING'] },
        id: { not: bookId },
      },
    });
    if (lockedCount >= MAX_LOCKED_BOOKS) {
      throw new BadRequestException(
        `Limite atteinte: ${MAX_LOCKED_BOOKS} livres non debloques. Debloquez-en un pour en generer un nouveau.`,
      );
    }

    await this.prisma.book.update({
      where: { id: bookId },
      data: { status: 'GENERATING', unlocked: false },
    });

    const chapters = dto.chapters ?? 8;
    const wordsPerChapter = this.wordsPerChapter(dto.pages, chapters);

    // Fire-and-forget: la generation peut prendre plusieurs minutes
    void this.run(bookId, chapters, wordsPerChapter);

    return { bookId, status: 'GENERATING' };
  }

  /**
   * Debloque un livre genere: debite les credits puis ouvre la lecture complete + export.
   * Idempotent (ne debite qu'une fois). Leve si solde insuffisant.
   */
  async unlock(userId: string, bookId: string) {
    const book = await this.books.findOne(userId, bookId); // ownership

    if (book.unlocked) {
      return { bookId, unlocked: true, creditsSpent: 0 };
    }
    if (book.status !== 'READY') {
      throw new BadRequestException(
        'Le livre doit etre genere avant le deblocage',
      );
    }

    await this.credits.debit(userId, this.unlockCost, `unlock:${bookId}`);
    await this.prisma.book.update({
      where: { id: bookId },
      data: { unlocked: true },
    });

    return { bookId, unlocked: true, creditsSpent: this.unlockCost };
  }

  /** Traduit pages cibles -> mots par chapitre (borne pour rester sous la limite Groq). */
  private wordsPerChapter(pages: number | undefined, chapters: number): number {
    if (!pages) return DEFAULT_WORDS_PER_CHAPTER;
    const total = pages * WORDS_PER_PAGE;
    const per = Math.round(total / chapters);
    return Math.min(MAX_WORDS, Math.max(MIN_WORDS, per));
  }

  async status(userId: string, bookId: string) {
    const book = await this.books.findOne(userId, bookId);
    const done = book.chapters.filter((c) => c.status === 'DONE').length;
    return {
      status: book.status,
      progress: book.chapters.length
        ? Math.round((done / book.chapters.length) * 100)
        : 0,
      chapters: book.chapters.length,
      coverUrl: book.coverUrl,
      unlocked: book.unlocked,
    };
  }

  private async run(
    bookId: string,
    nbChapters: number,
    wordsPerChapter: number,
  ) {
    try {
      const book = await this.prisma.book.findUniqueOrThrow({
        where: { id: bookId },
      });

      const result = await this.callGenerator(
        book,
        nbChapters,
        wordsPerChapter,
      );

      // Remplace les chapitres existants
      await this.prisma.chapter.deleteMany({ where: { bookId } });
      await this.prisma.chapter.createMany({
        data: result.chapters.map((c) => ({
          bookId,
          order: c.order,
          title: c.title,
          content: c.content,
          status: 'DONE',
        })),
      });

      await this.prisma.book.update({
        where: { id: bookId },
        data: { status: 'READY', coverUrl: result.coverUrl },
      });
      this.logger.log(`Book ${bookId} genere (${result.chapters.length} ch.)`);
    } catch (e) {
      this.logger.error(`Echec generation ${bookId}: ${e}`);
      await this.prisma.book.update({
        where: { id: bookId },
        data: { status: 'FAILED' },
      });
      // Pas de remboursement: la generation est gratuite (cout au deblocage).
    }
  }

  /**
   * Appelle le workflow n8n. Si N8N_WEBHOOK_URL absent -> contenu mock.
   * n8n doit repondre (node "Respond to Webhook") un JSON:
   * { coverUrl?, chapters: [{ order, title, content }] }
   */
  private async callGenerator(
    book: {
      id: string;
      title: string;
      topic: string;
      audience: string | null;
      tone: string | null;
      language: string;
      style: string;
    },
    nbChapters: number,
    wordsPerChapter: number,
  ): Promise<GenerationResult> {
    const url = process.env.N8N_WEBHOOK_URL;

    if (!url) {
      return this.mock(book, nbChapters);
    }

    const { data } = await axios.post<GenerationResult>(
      url,
      {
        bookId: book.id,
        title: book.title,
        topic: book.topic,
        audience: book.audience,
        tone: book.tone,
        language: book.language,
        style: book.style,
        chapters: nbChapters,
        wordsPerChapter,
      },
      {
        headers: process.env.N8N_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${process.env.N8N_WEBHOOK_TOKEN}` }
          : undefined,
        timeout: 1000 * 60 * 10, // 10 min
      },
    );

    if (!data?.chapters?.length) {
      throw new Error('Reponse n8n invalide (chapters manquants)');
    }
    return data;
  }

  private mock(
    book: { title: string; topic: string },
    nbChapters: number,
  ): GenerationResult {
    const chapters: GeneratedChapter[] = Array.from(
      { length: nbChapters },
      (_, i) => ({
        order: i + 1,
        title: `Chapitre ${i + 1} — ${book.topic}`,
        content:
          `Contenu mock du chapitre ${i + 1} pour « ${book.title} ».\n\n` +
          `Configure N8N_WEBHOOK_URL pour brancher la vraie generation IA.`,
      }),
    );
    return { coverUrl: undefined, chapters };
  }
}
