import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kundenbewertungen | ON ME HONEY B',
  description: 'Echte Bewertungen von ON ME Kunden — Qualität, Druck, Passform, Versand. Teile auch deine Erfahrung.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
