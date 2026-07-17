import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AppAuthGuard } from './auth/app-auth.guard';
import { AuditModule } from './audit/audit.module';
import { ControlsModule } from './controls/controls.module';
import { RisksModule } from './risks/risks.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AuditModule,
    ControlsModule,
    RisksModule,
    DashboardModule,
    ReportsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AppAuthGuard }],
})
export class AppModule {}
