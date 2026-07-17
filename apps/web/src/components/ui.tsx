import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { ControlStatus, RiskStatus } from '@/lib/types';
import { CONTROL_STATUS_LABEL, RISK_STATUS_LABEL } from '@/lib/types';

export function Card({
  title,
  subtitle,
  children,
  className,
  actions,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={clsx('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

const CONTROL_BADGE: Record<ControlStatus, string> = {
  IMPLEMENTED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  OPEN: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  NOT_APPLICABLE: 'bg-slate-100 text-slate-500 ring-slate-500/20',
};

export function StatusBadge({ status }: { status: ControlStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        CONTROL_BADGE[status],
      )}
    >
      {CONTROL_STATUS_LABEL[status]}
    </span>
  );
}

const RISK_BADGE: Record<RiskStatus, string> = {
  OPEN: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  MITIGATING: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  MITIGATED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  ACCEPTED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export function RiskBadge({ status }: { status: RiskStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        RISK_BADGE[status],
      )}
    >
      {RISK_STATUS_LABEL[status]}
    </span>
  );
}

export function riskLevel(score: number): { label: string; className: string } {
  if (score >= 15) return { label: 'Kritisch', className: 'bg-rose-600 text-white' };
  if (score >= 10) return { label: 'Hoch', className: 'bg-rose-100 text-rose-700' };
  if (score >= 5) return { label: 'Mittel', className: 'bg-amber-100 text-amber-700' };
  return { label: 'Niedrig', className: 'bg-emerald-100 text-emerald-700' };
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50',
        variant === 'primary' && 'bg-brand-600 text-white hover:bg-brand-700',
        variant === 'secondary' &&
          'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
        variant === 'ghost' && 'text-slate-600 hover:bg-slate-100',
      )}
    >
      {children}
    </button>
  );
}

export function ScoreBar({ value }: { value: number }) {
  const color =
    value >= 80 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={clsx('h-full rounded-full', color)} style={{ width: `${value}%` }} />
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-slate-500">
      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      Lade Daten …
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <strong>Fehler beim Laden.</strong> Läuft die API? ({message})
    </div>
  );
}
