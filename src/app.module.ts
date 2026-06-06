import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CreditsModule } from './credits/credits.module';
import { BooksModule } from './books/books.module';
import { GenerationModule } from './generation/generation.module';
import { PaymentsModule } from './payments/payments.module';
import { ExportModule } from './export/export.module';
import { NicheModule } from './niche/niche.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CreditsModule,
    BooksModule,
    GenerationModule,
    PaymentsModule,
    ExportModule,
    NicheModule,
  ],
})
export class AppModule {}
