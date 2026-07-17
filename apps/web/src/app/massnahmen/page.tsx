'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Control, ControlStatus, MeasureArea } from '@/lib/types';
import { CONTROL_STATUS_LABEL } from '@/lib/types';
import { Card, ErrorBox, Spinner, StatusBadge } from '@/components/ui';

const STATUSES: ControlStatus[] = ['OPEN', 'IN_PROGRESS', 'IMPLEMENTED', 'NOT_APPLICABLE'];

export default function ControlsPage() {
  const [areas, setAreas] = useState<MeasureArea[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () =>
    api<MeasureArea[]>('/controls').then(setAreas).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(control: Control, status: ControlStatus) {
    setSavingId(control.id);
    try {
      await api(`/controls/${control.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  }

  if (error) return <ErrorBox message={error} />;
  if (!areas) return <Spinner />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Maßnahmen-Check</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bewerte jede Maßnahme – jede Statusänderung wird revisionssicher im Audit-Log
          dokumentiert.
        </p>
      </header>

      {areas.map((area) => (
        <Card key={area.id} title={area.name} subtitle={area.description}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-3 font-medium">Code</th>
                  <th className="py-2 pr-3 font-medium">Maßnahme</th>
                  <th className="py-2 pr-3 font-medium">Gewicht</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium">Bewertung ändern</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {area.controls.map((control) => (
                  <tr key={control.id} className="align-top">
                    <td className="py-3 pr-3 font-mono text-xs text-slate-400">{control.code}</td>
                    <td className="py-3 pr-3">
                      <div className="font-medium text-slate-800">{control.title}</div>
                      <p className="mt-0.5 max-w-xl text-xs text-slate-500">
                        {control.description}
                      </p>
                      {control.status !== 'IMPLEMENTED' && control.guidance && (
                        <p className="mt-1 max-w-xl text-xs text-brand-700">
                          → {control.guidance}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-center text-slate-500">{control.weight}</td>
                    <td className="py-3 pr-3">
                      <StatusBadge status={control.status} />
                    </td>
                    <td className="py-3">
                      <select
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none disabled:opacity-50"
                        value={control.status}
                        disabled={savingId === control.id}
                        onChange={(e) => updateStatus(control, e.target.value as ControlStatus)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {CONTROL_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}
