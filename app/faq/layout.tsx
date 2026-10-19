import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ | ON ME HONEY B',
  description: 'Häufige Fragen zu ON ME HONEY B — Versand, Produktion, Druckqualität, Größen, Widerrufsrecht und mehr.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
