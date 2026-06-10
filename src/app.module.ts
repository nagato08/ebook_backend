import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CreditsModule } from './credits/credits.module';
import { BooksModule } from './books/books.module';
import { GenerationModule } from './generation/generation.module';
import { PaymentsModule } from './payments/payments.module';
import { ExportModule } from './export/export.module';
import { NicheModule } from './niche/niche.module';
import { SettingsModule } from './settings/settings.module';
import { AdminModule } from './admin/admin.module';
import { MaintenanceGuard } from './common/guards/maintenance.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-prod-super-secret',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CreditsModule,
    BooksModule,
    GenerationModule,
    PaymentsModule,
    ExportModule,
    NicheModule,
    SettingsModule,
    AdminModule,
  ],
  providers: [
    // Guard global: applique le mode maintenance a toutes les routes.
    { provide: APP_GUARD, useClass: MaintenanceGuard },
  ],
})
export class AppModule {}
