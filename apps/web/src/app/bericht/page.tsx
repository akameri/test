'use client';

import { useEffect, useState } from 'react';
import { API_URL, api } from '@/lib/api';
import type { ControlStatus, Gap } from '@/lib/types';
import { Button, Card, ErrorBox, ScoreBar, Spinner, StatusBadge } from '@/components/ui';

interface Report {
  title: string;
  generatedAt: string;
  complianceScore: number;
  auditTrail: { entries: number; chainValid: boolean; checked: number };
  areas: Array<{
    key: string;
    name: string;
    description: string;
    controls: Array<{
      code: string;
      title: string;
      status: ControlStatus;
      weight: number;
      note: string;
      updatedAt: string;
    }>;
  }>;
  topGaps: Gap[];
  openRisks: Array<{ id: string; title: string; score: number; owner: string }>;
}

export default function ReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Report>('/reports/compliance').then(setReport).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!report) return <Spinner />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-semibold">Compliance-Bericht</h1>
          <p className="mt-1 text-sm text-slate-500">
            Der Nachweis „per Knopfdruck“ – für Geschäftsführung, Auditor oder Behörde.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            Drucken / PDF
          </Button>
          <a href={`${API_URL}/reports/audit-export?format=json`}>
            <Button variant="secondary">JSON herunterladen</Button>
          </a>
        </div>
      </header>

      <Card>
        <div className="space-y-1 text-sm">
          <h2 className="text-lg font-semibold">{report.title}</h2>
          <p className="text-slate-500">
            Erstellt am {new Date(report.generatedAt).toLocaleString('de-AT')}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-6">
            <div>
              <div className="text-3xl font-bold text-brand-700">{report.complianceScore}%</div>
              <div className="text-xs text-slate-500">Compliance-Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-700">{report.auditTrail.entries}</div>
              <div className="text-xs text-slate-500">Audit-Log-Einträge</div>
            </div>
            <div>
              <div
                className={`text-lg font-semibold ${
                  report.auditTrail.chainValid ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {report.auditTrail.chainValid ? '✔ Integrität bestätigt' : '✘ Integrität verletzt'}
              </div>
              <div className="text-xs text-slate-500">
                SHA-256-Hash-Kette über {report.auditTrail.checked} Einträge geprüft
              </div>
            </div>
          </div>
        </div>
      </Card>

      {report.areas.map((area) => {
        const relevant = area.controls.filter((c) => c.status !== 'NOT_APPLICABLE');
        const done = relevant.filter((c) => c.status === 'IMPLEMENTED').length;
        const pct = relevant.length ? Math.round((done / relevant.length) * 100) : 100;
        return (
          <Card key={area.key} title={area.name} subtitle={area.description}>
            <div className="mb-3 flex items-center gap-3">
              <div className="w-40 shrink-0 text-xs text-slate-500">
                {done} von {relevant.length} umgesetzt
              </div>
              <ScoreBar value={pct} />
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-50">
                {area.controls.map((control) => (
                  <tr key={control.code}>
                    <td className="w-16 py-2 pr-3 font-mono text-xs text-slate-400">
                      {control.code}
                    </td>
                    <td className="py-2 pr-3">
                      {control.title}
                      {control.note && (
                        <p className="mt-0.5 text-xs italic text-slate-500">„{control.note}“</p>
                      )}
                    </td>
                    <td className="w-36 py-2 text-right">
                      <StatusBadge status={control.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        );
      })}
    </div>
  );
}
