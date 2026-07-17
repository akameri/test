'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { DashboardSummary } from '@/lib/types';
import { Card, ErrorBox, ScoreBar, Spinner, StatusBadge, riskLevel } from '@/components/ui';
import { AreaBars, ScoreGauge } from '@/components/charts';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<DashboardSummary>('/dashboard/summary').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Spinner />;

  const worstAreas = [...data.areas].sort((a, b) => a.score - b.score).slice(0, 3);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Wo stehen wir?</h1>
        <p className="mt-1 text-sm text-slate-500">
          NIS-2-Compliance auf einen Blick – Stand{' '}
          {new Date(data.generatedAt).toLocaleString('de-AT')}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Gesamtstatus" subtitle="Gewichteter Umsetzungsgrad aller Maßnahmen">
          <ScoreGauge score={data.complianceScore} />
          <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-slate-50 py-2">
              <dt className="text-[11px] text-slate-500">Lücken</dt>
              <dd className="text-lg font-semibold text-rose-600">{data.totalGaps}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 py-2">
              <dt className="text-[11px] text-slate-500">Offene Risiken</dt>
              <dd className="text-lg font-semibold text-amber-600">{data.totalOpenRisks}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 py-2">
              <dt className="text-[11px] text-slate-500">Bereiche</dt>
              <dd className="text-lg font-semibold text-slate-700">{data.areas.length}</dd>
            </div>
          </dl>
        </Card>

        <Card
          title="Umsetzungsgrad je NIS-2-Bereich"
          subtitle="Art. 21 Abs. 2 lit. a–j und Art. 23"
          className="lg:col-span-2"
        >
          <AreaBars areas={data.areas} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="Das sind die Lücken"
          subtitle="Wichtigste offene Maßnahmen (nach Gewicht)"
          actions={
            <Link href="/massnahmen" className="text-xs font-medium text-brand-600 hover:underline">
              Alle Maßnahmen →
            </Link>
          }
        >
          <ul className="divide-y divide-slate-100">
            {data.topGaps.map((gap) => (
              <li key={gap.code} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    <span className="mr-2 font-mono text-xs text-slate-400">{gap.code}</span>
                    {gap.title}
                  </span>
                  <StatusBadge status={gap.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  <span className="font-medium text-slate-600">Nächster Schritt:</span>{' '}
                  {gap.guidance}
                </p>
              </li>
            ))}
            {data.topGaps.length === 0 && (
              <li className="py-6 text-center text-sm text-slate-500">
                Keine offenen Maßnahmen – ausgezeichnet! 🎉
              </li>
            )}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card
            title="Größte offene Risiken"
            actions={
              <Link href="/risiken" className="text-xs font-medium text-brand-600 hover:underline">
                Risikoregister →
              </Link>
            }
          >
            <ul className="divide-y divide-slate-100">
              {data.openRisks.map((risk) => {
                const level = riskLevel(risk.score);
                return (
                  <li key={risk.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-sm">{risk.title}</span>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${level.className}`}
                    >
                      {level.label} · {risk.score}
                    </span>
                  </li>
                );
              })}
              {data.openRisks.length === 0 && (
                <li className="py-6 text-center text-sm text-slate-500">
                  Keine offenen Risiken erfasst.
                </li>
              )}
            </ul>
          </Card>

          <Card title="Handlungsbedarf nach Bereich" subtitle="Die drei schwächsten Bereiche">
            <ul className="space-y-3">
              {worstAreas.map((area) => (
                <li key={area.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{area.name}</span>
                    <span className="font-medium">{area.score}%</span>
                  </div>
                  <ScoreBar value={area.score} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
