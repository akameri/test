'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const items = [
  { href: '/', label: 'Dashboard' },
  { href: '/massnahmen', label: 'Maßnahmen' },
  { href: '/risiken', label: 'Risiken' },
  { href: '/audit', label: 'Audit-Log' },
  { href: '/bericht', label: 'Bericht' },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            N2
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">NIS-2 GRC</div>
            <div className="text-[11px] text-slate-500">Compliance-Check</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 px-5 py-4 text-[11px] leading-relaxed text-slate-400">
        Single Point of Truth für Compliance &amp; Sicherheit
      </div>
    </aside>
  );
}
