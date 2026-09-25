import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project TenantPlus — Rapid Eviction Notice Triage',
  description: 'Rapid eviction notice triage platform for tenants and legal aid clinics with hybrid deterministic legal calculation and interactive document clause inspection.',
  openGraph: {
    title: 'Project TenantPlus — Rapid Eviction Notice Triage',
    description: 'Rapid eviction notice triage platform for tenants and legal aid clinics with hybrid deterministic legal calculation and interactive document clause inspection.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Project TenantPlus — Rapid Eviction Notice Triage',
    description: 'Rapid eviction notice triage platform for tenants and legal aid clinics with hybrid deterministic legal calculation and interactive document clause inspection.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
