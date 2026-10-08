import type { ReactNode } from 'react';

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

/** Legal text in the v3 layout. English only; the Arabic footer links here with a note. */
export function LegalPageLayout({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <section className="legal">
      <div className="wrap">
        <h1>{title}</h1>
        <p className="upd">Last updated: {lastUpdated}</p>
        <div className="prose">{children}</div>
      </div>
    </section>
  );
}
