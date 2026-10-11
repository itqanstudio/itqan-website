import { headers } from 'next/headers';
import { bookingCopy, fill, type BookingCopy } from '@/content/v3/booking';
import type { Lang } from '@/content/v3/types';
import { initialSlots } from '@/lib/crm/initial-slots';
import { ipFromHeaders } from '@/lib/scheduling/http';
import { Rich } from '../brand';
import { BookingWidget } from './BookingWidget';
import '@/styles/v3/book.css';

interface BookPageProps {
  lang: Lang;
  topic: 'briefing' | 'security';
  /** From `?with=<slug>`, already checked against the slug pattern. */
  withSlug?: string;
}

type Heading = BookingCopy['title'];

function heading(t: BookingCopy, minutes: number | undefined): Heading {
  if (!minutes) return t.titleNoLength;
  const [before, highlight, after] = t.title;
  return [fill(before, { n: minutes }), fill(highlight, { n: minutes }), after === undefined ? undefined : fill(after, { n: minutes })];
}

export async function BookPage({ lang, topic, withSlug }: BookPageProps) {
  const t = bookingCopy[lang];
  // The CRM sets the call length; a slow or missing answer leaves the number out and the widget loads the times itself.
  const initial = await initialSlots(withSlug, ipFromHeaders(headers()));
  const minutes = initial?.slotMinutes;
  const points = [minutes ? fill(t.pointLength, { n: minutes }) : t.pointNoLength, ...t.points];
  return (
    <section className="bk" aria-labelledby="bk-title">
      <div className="wrap bk-grid">
        <div className="bk-intro">
          <p className="k">
            <b>{t.kicker}</b>
          </p>
          <h1 id="bk-title">
            <Rich value={heading(t, minutes)} />
          </h1>
          <p className="lead">{t.lead}</p>
          {topic === 'security' && <p className="bk-sec">{t.securityLead}</p>}
          <ul className="meta">
            {points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <BookingWidget t={t} lang={lang} topic={topic} withSlug={withSlug} initial={initial} />
      </div>
    </section>
  );
}

export function parseTopic(value: string | string[] | undefined): 'briefing' | 'security' {
  return value === 'security' ? 'security' : 'briefing';
}
