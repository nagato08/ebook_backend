"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const marked_1 = require("marked");
const puppeteer_1 = __importDefault(require("puppeteer"));
const epub_gen_memory_1 = __importDefault(require("epub-gen-memory"));
const books_service_1 = require("../books/books.service");
const COVER_THEMES = {
    Moderne: ['#5b21b6', '#6d28d9', true],
    Luxe: ['#2a2440', '#0f0d1a', true],
    Éducatif: ['#10b981', '#0f766e', true],
    Énergique: ['#f97316', '#dc2626', true],
    Minimal: ['#f4f4f5', '#d4d4d8', false],
    Créatif: ['#d946ef', '#e11d48', true],
    Tech: ['#0284c7', '#3730a3', true],
    Nature: ['#16a34a', '#065f46', true],
};
const DEFAULT_THEME = ['#15130f', '#3f3a30', true];
let ExportService = class ExportService {
    books;
    constructor(books) {
        this.books = books;
    }
    async load(userId, bookId) {
        const book = await this.books.findOne(userId, bookId);
        if (!book.unlocked) {
            throw new common_1.BadRequestException('Livre verrouille. Debloquez-le pour telecharger le PDF/EPUB.');
        }
        const chapters = book.chapters.filter((c) => c.content);
        if (!chapters.length) {
            throw new common_1.BadRequestException('Aucun chapitre genere. Lancez la generation avant d export.');
        }
        return {
            title: book.title,
            topic: book.topic,
            style: book.style,
            language: book.language,
            coverUrl: book.coverUrl,
            chapters,
        };
    }
    slug(s) {
        return (s
            .normalize('NFD')
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase()
            .slice(0, 60) || 'ebook');
    }
    renderHtml(book) {
        const en = book.language === 'en';
        const L = {
            toc: en ? 'Contents' : 'Sommaire',
            chapter: en ? 'Chapter' : 'Chapitre',
        };
        const [c1, c2, lightText] = COVER_THEMES[book.style] ?? DEFAULT_THEME;
        const coverText = lightText ? '#ffffff' : '#15130f';
        const coverMuted = lightText ? 'rgba(255,255,255,0.8)' : 'rgba(21,19,15,0.7)';
        const coverLine = lightText ? 'rgba(255,255,255,0.4)' : 'rgba(21,19,15,0.25)';
        const toc = book.chapters
            .map((c) => `<li><span class="toc-num">${c.order}.</span> ${this.escape(c.title)}</li>`)
            .join('\n');
        const chaptersHtml = book.chapters
            .map((c) => {
            const body = marked_1.marked.parse(c.content ?? '', { async: false });
            return `
          <section class="chapter">
            <h1 class="chapter-title">
              <span class="chapter-num">${L.chapter} ${c.order}</span>
              ${this.escape(c.title)}
            </h1>
            ${body}
          </section>`;
        })
            .join('\n');
        return `<!doctype html>
<html lang="${book.language}">
<head>
<meta charset="utf-8" />
<style>
  @page { margin: 25mm 20mm; }
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12pt; line-height: 1.7; color: #1a1a1a; margin: 0;
  }
  .cover {
    height: 247mm; border-radius: 8mm; overflow: hidden;
    background: linear-gradient(150deg, ${c1} 0%, ${c2} 100%);
    color: ${coverText};
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 22mm 18mm; page-break-after: always;
  }
  .cover-tag {
    align-self: flex-start; font-size: 9pt; letter-spacing: 3px;
    text-transform: uppercase; font-weight: bold; padding: 4px 12px;
    border: 1px solid ${coverLine}; border-radius: 999px;
    font-family: Georgia, serif;
  }
  .cover-main { margin-top: auto; }
  .cover-rule { width: 56px; height: 3px; background: ${coverText}; margin-bottom: 10mm; opacity: 0.9; }
  .cover h1 { font-size: 40pt; margin: 0; line-height: 1.12; font-weight: bold; }
  .cover .topic {
    margin: 8mm 0 0; font-size: 13pt; line-height: 1.5;
    color: ${coverMuted}; max-width: 80%;
  }
  .cover-foot { font-size: 9pt; letter-spacing: 1px; color: ${coverMuted}; text-transform: uppercase; }
  .toc { page-break-after: always; }
  .toc h2 { font-size: 20pt; border-bottom: 2px solid #222; padding-bottom: 8px; }
  .toc ul { list-style: none; padding: 0; }
  .toc li { padding: 6px 0; font-size: 12.5pt; border-bottom: 1px dotted #ccc; }
  .toc-num { font-weight: bold; margin-right: 8px; }
  .chapter { page-break-before: always; }
  .chapter-title { font-size: 22pt; margin: 0 0 6px; line-height: 1.25; }
  .chapter-num {
    display: block; font-size: 11pt; text-transform: uppercase;
    letter-spacing: 2px; color: #888; font-weight: normal; margin-bottom: 4px;
  }
  h2 { font-size: 16pt; margin-top: 24px; }
  h3 { font-size: 13.5pt; margin-top: 18px; }
  p { margin: 0 0 12px; text-align: justify; }
  ul, ol { margin: 0 0 12px; padding-left: 24px; }
  li { margin-bottom: 4px; }
  code {
    background: #f4f4f4; padding: 1px 5px; border-radius: 3px;
    font-family: 'Courier New', monospace; font-size: 10.5pt;
  }
  blockquote {
    border-left: 3px solid #ccc; margin: 0 0 12px; padding-left: 16px;
    color: #555; font-style: italic;
  }
</style>
</head>
<body>
  <div class="cover">
    <span class="cover-tag">${this.escape(book.style || 'Guide')}</span>
    <div class="cover-main">
      <div class="cover-rule"></div>
      <h1>${this.escape(book.title)}</h1>
      <div class="topic">${this.escape(book.topic)}</div>
    </div>
    <div class="cover-foot">${this.escape(book.author ?? 'EbookGen')}</div>
  </div>
  <div class="toc">
    <h2>${L.toc}</h2>
    <ul>${toc}</ul>
  </div>
  ${chaptersHtml}
</body>
</html>`;
    }
    escape(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    async toPdf(userId, bookId) {
        const book = await this.load(userId, bookId);
        const html = this.renderHtml(book);
        const browser = await puppeteer_1.default.launch({
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'load' });
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                displayHeaderFooter: true,
                headerTemplate: '<span></span>',
                footerTemplate: '<div style="width:100%;font-size:9px;color:#999;text-align:center;">' +
                    '<span class="pageNumber"></span> / <span class="totalPages"></span></div>',
            });
            return {
                buffer: Buffer.from(pdf),
                filename: `${this.slug(book.title)}.pdf`,
            };
        }
        finally {
            await browser.close();
        }
    }
    async toEpub(userId, bookId) {
        const book = await this.load(userId, bookId);
        const chapters = book.chapters.map((c) => ({
            title: c.title,
            content: marked_1.marked.parse(c.content ?? '', { async: false }),
        }));
        const en = book.language === 'en';
        const buffer = await (0, epub_gen_memory_1.default)({
            title: book.title,
            description: book.topic,
            author: book.author ?? 'EbookGen',
            lang: book.language,
            tocTitle: en ? 'Contents' : 'Sommaire',
            cover: book.coverUrl ?? undefined,
        }, chapters);
        return {
            buffer: Buffer.from(buffer),
            filename: `${this.slug(book.title)}.epub`,
        };
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [books_service_1.BooksService])
], ExportService);
//# sourceMappingURL=export.service.js.map