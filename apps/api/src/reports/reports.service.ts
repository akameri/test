import { Injectable } from '@nestjs/common';
import { DashboardService } from '../dashboard/dashboard.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly audit: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Management-/Audit-Bericht: kompletter Compliance-Stand inkl.
   * Integritätsnachweis des Audit-Logs ("per Knopfdruck").
   */
  async complianceReport() {
    const [summary, chain, controls, auditCount] = await Promise.all([
      this.dashboard.computeSummary(),
      this.audit.verifyChain(),
      this.prisma.measureArea.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { controls: { orderBy: { code: 'asc' } } },
      }),
      this.prisma.auditLog.count(),
    ]);
    return {
      title: 'NIS-2 Compliance-Bericht',
      generatedAt: summary.generatedAt,
      complianceScore: summary.complianceScore,
      auditTrail: {
        entries: auditCount,
        chainValid: chain.valid,
        checked: chain.checked,
      },
      areas: controls.map((a) => ({
        key: a.key,
        name: a.name,
        description: a.description,
        controls: a.controls.map((c) => ({
          code: c.code,
          title: c.title,
          status: c.status,
          weight: c.weight,
          note: c.note,
          updatedAt: c.updatedAt,
        })),
      })),
      topGaps: summary.topGaps,
      openRisks: summary.openRisks,
    };
  }

  /** Audit-Log als CSV (Excel-kompatibel, Semikolon-separiert). */
  async auditCsv(): Promise<string> {
    const entries = await this.audit.exportAll();
    const esc = (v: unknown) => {
      const s = v == null ? '' : typeof v === 'string' ? v : JSON.stringify(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const header = [
      'ID',
      'Zeitstempel',
      'Benutzer-ID',
      'Benutzer',
      'Aktion',
      'Objekttyp',
      'Objekt-ID',
      'Alter Wert',
      'Neuer Wert',
      'Hash',
      'Vorgänger-Hash',
    ].join(';');
    const rows = entries.map((e) =>
      [
        e.id,
        e.ts.toISOString(),
        e.actorId,
        e.actorName,
        e.action,
        e.entityType,
        e.entityId,
        e.oldValue,
        e.newValue,
        e.hash,
        e.prevHash,
      ]
        .map(esc)
        .join(';'),
    );
    return '﻿' + [header, ...rows].join('\r\n');
  }
}
