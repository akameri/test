'use client';

import { useEffect, useState } from 'react';
import { API_URL, api } from '@/lib/api';
import type { AuditEntry } from '@/lib/types';
import { Button, Card, ErrorBox, Spinner } from '@/components/ui';

interface AuditList {
  total: number;
  page: number;
  pageSize: number;
  items: AuditEntry[];
}

interface ChainStatus {
  valid: boolean;
  checked: number;
  brokenAtId?: string;
}

export default function AuditPage() {
  const [data, setData] = useState<AuditList | null>(null);
  const [chain, setChain] = useState<ChainStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api<AuditList>(`/audit?page=${page}&pageSize=25`)
      .then(setData)
      .catch((e) => setError(e.message));
    api<ChainStatus>('/audit/verify').then(setChain).catch(() => {});
  }, [page]);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Spinner />;

  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Unveränderbares Audit-Log</h1>
          <p className="mt-1 text-sm text-slate-500">
            Jede Änderung mit Zeitstempel, Benutzer und Vorher-/Nachher-Wert – append-only und
            per SHA-256-Hash-Kette gegen Manipulation gesichert.
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`${API_URL}/reports/audit-export?format=csv`}>
            <Button variant="secondary">CSV exportieren</Button>
          </a>
          <a href={`${API_URL}/reports/audit-export?format=json`}>
            <Button variant="secondary">Bericht (JSON)</Button>
          </a>
        </div>
      </header>

      {chain && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            chain.valid
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {chain.valid ? (
            <>
              ✔ Integrität bestätigt: Hash-Kette über {chain.checked} Einträge ist gültig.
            </>
          ) : (
            <>
              ✘ Integritätsverletzung! Kette ab Eintrag {chain.brokenAtId} ungültig – bitte
              Sicherheitsverantwortliche informieren.
            </>
          )}
        </div>
      )}

      <Card title={`Einträge (${data.total})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-3 font-medium">Zeitpunkt</th>
                <th className="py-2 pr-3 font-medium">Benutzer</th>
                <th className="py-2 pr-3 font-medium">Aktion</th>
                <th className="py-2 pr-3 font-medium">Objekt</th>
                <th className="py-2 pr-3 font-medium">Vorher</th>
                <th className="py-2 font-medium">Nachher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.items.map((entry) => (
                <tr key={entry.id} className="align-top">
                  <td className="whitespace-nowrap py-2.5 pr-3 text-xs text-slate-500">
                    {new Date(entry.ts).toLocaleString('de-AT')}
                  </td>
                  <td className="py-2.5 pr-3">{entry.actorName}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs">{entry.action}</td>
                  <td className="py-2.5 pr-3 text-xs">
                    {entry.entityType} <span className="text-slate-400">{entry.entityId}</span>
                  </td>
                  <td className="max-w-[180px] break-all py-2.5 pr-3 font-mono text-[11px] text-slate-500">
                    {entry.oldValue ? JSON.stringify(entry.oldValue) : '–'}
                  </td>
                  <td className="max-w-[180px] break-all py-2.5 font-mono text-[11px] text-slate-500">
                    {entry.newValue ? JSON.stringify(entry.newValue) : '–'}
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                    Noch keine Einträge. Ändere z. B. den Status einer Maßnahme – die Änderung
                    erscheint hier sofort.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              ← Zurück
            </Button>
            <span className="text-slate-500">
              Seite {page} von {pages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
            >
              Weiter →
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
