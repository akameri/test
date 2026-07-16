'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import type { Risk, RiskStatus } from '@/lib/types';
import { RISK_STATUS_LABEL } from '@/lib/types';
import { Button, Card, ErrorBox, RiskBadge, Spinner, riskLevel } from '@/components/ui';

const STATUSES: RiskStatus[] = ['OPEN', 'MITIGATING', 'MITIGATED', 'ACCEPTED'];

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => api<Risk[]>('/risks').then(setRisks).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  async function createRisk(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await api('/risks', {
        method: 'POST',
        body: JSON.stringify({
          title: String(form.get('title')),
          description: String(form.get('description') ?? ''),
          likelihood: Number(form.get('likelihood')),
          impact: Number(form.get('impact')),
          owner: String(form.get('owner') ?? ''),
        }),
      });
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(risk: Risk, status: RiskStatus) {
    try {
      await api(`/risks/${risk.id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (error) return <ErrorBox message={error} />;
  if (!risks) return <Spinner />;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">Risikoregister</h1>
          <p className="mt-1 text-sm text-slate-500">
            Risiko = Eintrittswahrscheinlichkeit × Auswirkung (je 1–5). Änderungen sind
            revisionssicher nachvollziehbar.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Abbrechen' : '+ Risiko erfassen'}
        </Button>
      </header>

      {showForm && (
        <Card title="Neues Risiko erfassen">
          <form onSubmit={createRisk} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-600">Titel *</span>
              <input
                name="title"
                required
                minLength={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="z. B. Ransomware-Befall der Produktionsserver"
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-600">Beschreibung</span>
              <textarea
                name="description"
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Eintrittswahrscheinlichkeit (1–5) *
              </span>
              <input
                name="likelihood"
                type="number"
                min={1}
                max={5}
                defaultValue={3}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Auswirkung (1–5) *
              </span>
              <input
                name="impact"
                type="number"
                min={1}
                max={5}
                defaultValue={3}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Verantwortlich (Risk Owner)
              </span>
              <input
                name="owner"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="z. B. IT-Leitung"
              />
            </label>
            <div className="md:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Speichere …' : 'Risiko speichern'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title={`Alle Risiken (${risks.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-3 font-medium">Risiko</th>
                <th className="py-2 pr-3 font-medium">W.</th>
                <th className="py-2 pr-3 font-medium">A.</th>
                <th className="py-2 pr-3 font-medium">Stufe</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Owner</th>
                <th className="py-2 font-medium">Status ändern</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {risks.map((risk) => {
                const level = riskLevel(risk.likelihood * risk.impact);
                return (
                  <tr key={risk.id} className="align-top">
                    <td className="max-w-md py-3 pr-3">
                      <div className="font-medium text-slate-800">{risk.title}</div>
                      {risk.description && (
                        <p className="mt-0.5 text-xs text-slate-500">{risk.description}</p>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-center">{risk.likelihood}</td>
                    <td className="py-3 pr-3 text-center">{risk.impact}</td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${level.className}`}
                      >
                        {level.label} · {risk.likelihood * risk.impact}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <RiskBadge status={risk.status} />
                    </td>
                    <td className="py-3 pr-3 text-xs text-slate-500">{risk.owner || '–'}</td>
                    <td className="py-3">
                      <select
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                        value={risk.status}
                        onChange={(e) => updateStatus(risk, e.target.value as RiskStatus)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {RISK_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
              {risks.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-slate-500">
                    Noch keine Risiken erfasst. Lege das erste Risiko an – z. B. aus deiner
                    letzten Risikoanalyse.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
