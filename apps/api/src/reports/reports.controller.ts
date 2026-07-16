import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('compliance')
  compliance() {
    return this.reports.complianceReport();
  }

  @Get('audit-export')
  async auditExport(@Query('format') format = 'csv', @Res() res: Response) {
    if (format === 'json') {
      const report = await this.reports.complianceReport();
      res
        .setHeader('Content-Type', 'application/json; charset=utf-8')
        .setHeader('Content-Disposition', 'attachment; filename="nis2-compliance-bericht.json"')
        .send(JSON.stringify(report, null, 2));
      return;
    }
    const csv = await this.reports.auditCsv();
    res
      .setHeader('Content-Type', 'text/csv; charset=utf-8')
      .setHeader('Content-Disposition', 'attachment; filename="nis2-audit-log.csv"')
      .send(csv);
  }
}
