import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Observatório Educacional',
  description: 'Dados INEP 2023 — Ensino Fundamental I',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="theme-dark">
      <body>{children}</body>
    </html>
  );
}
