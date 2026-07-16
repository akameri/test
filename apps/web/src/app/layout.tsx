import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/nav';

export const metadata: Metadata = {
  title: 'NIS-2 GRC – Compliance-Check',
  description:
    'Single Point of Truth für NIS-2-Compliance: Maßnahmen, Risiken und revisionssichere Audit-Nachweise.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <div className="flex min-h-screen">
          <Nav />
          <main className="flex-1 px-8 py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
