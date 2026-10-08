import { bookingCopy } from '@/content/v3/booking';
import type { Lang } from '@/content/v3/types';
import { Rich } from '../brand';
import { BookingWidget } from './BookingWidget';
import '@/styles/v3/book.css';

interface BookPageProps {
  lang: Lang;
  topic: 'briefing' | 'security';
}

export function BookPage({ lang, topic }: BookPageProps) {
  const t = bookingCopy[lang];
  return (
    <section className="bk" aria-labelledby="bk-title">
      <div className="wrap bk-grid">
        <div className="bk-intro">
          <p className="k">
            <b>{t.kicker}</b>
          </p>
          <h1 id="bk-title">
            <Rich value={t.title} />
          </h1>
          <p className="lead">{t.lead}</p>
          {topic === 'security' && <p className="bk-sec">{t.securityLead}</p>}
          <ul className="meta">
            {t.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <BookingWidget t={t} lang={lang} topic={topic} />
      </div>
    </section>
  );
}

export function parseTopic(value: string | string[] | undefined): 'briefing' | 'security' {
  return value === 'security' ? 'security' : 'briefing';
}
