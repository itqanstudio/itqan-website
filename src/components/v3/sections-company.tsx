import Image from 'next/image';
import Link from 'next/link';
import type { SiteDict, Stat } from '@/content/v3/types';
import { STUDIO_EMAIL } from '@/lib/v3/seo';
import { Arrow, Lockup, Rich, Symbol } from './brand';
import { bookHref } from './sections';

interface Props {
  t: SiteDict;
}

export function Stats({ items, className }: { items: readonly Stat[]; className?: string }) {
  return (
    <dl className={`stats ${className ?? ''}`}>
      {items.map((s) => (
        <div key={s.label}>
          <dt>{s.label}</dt>
          <dd className={s.gradient ? 'g' : undefined}>{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A quote shown in its original language, marked so screen readers switch voice. */
export function Quote({ text, by, lang }: { text: string; by: string; lang: SiteDict['lang'] }) {
  const original = /[a-z]/i.test(text.slice(0, 12)) ? 'en' : lang;
  return (
    <figure className="quote" lang={original} dir={original === 'en' ? 'ltr' : 'rtl'}>
      <blockquote>“{text}”</blockquote>
      <figcaption>{by}</figcaption>
    </figure>
  );
}

export function Work({ t }: Props) {
  const s = t.work;
  const prefix = t.lang === 'en' ? '' : '/ar';
  return (
    <section className="s" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <div className="head">
          <p className="k">
            <b>{s.kicker}</b>
          </p>
          <h2 id="work-title" data-reveal>
            <Rich value={s.title} />
          </h2>
          <p className="lead">{s.lead}</p>
        </div>
        {s.cases.map((c, i) => (
          <article key={c.slug} className="case" data-reveal>
            <div className="im">
              <Image
                src={c.image}
                alt={c.imageAlt}
                fill
                sizes="(max-width: 900px) 100vw, 56vw"
                style={{ objectPosition: c.imagePosition }}
                priority={false}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
            <div className="bd">
              <p className="kick">{c.kicker}</p>
              <h3 lang="en" dir="ltr" style={{ justifySelf: 'start' }}>
                {c.title}
              </h3>
              <p>{c.body}</p>
              <Stats items={c.stats} />
              {c.quote && <Quote text={c.quote.text} by={c.quote.by} lang={t.lang} />}
              <div className="btns">
                <Link className="btn pri" href={`${prefix}/work/${c.slug}`}>
                  {s.read} <Arrow />
                </Link>
                {c.external && (
                  <a className="btn" href={c.external.href} target="_blank" rel="noopener noreferrer" lang="en">
                    {c.external.label} ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
        <div className="inhouse" data-reveal>
          <span className="lab">{s.inHouse.label}</span>
          <p>{s.inHouse.text}</p>
        </div>
        <ul className="also">
          <li className="lab">{s.alsoLabel}</li>
          {s.also.map((a) => (
            <li key={a.name} className="v">
              <span lang="en">{a.name}</span>
              {a.note && <small> · {a.note}</small>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Company({ t }: Props) {
  const s = t.company;
  return (
    <section className="s" id="company" aria-labelledby="company-title">
      <div className="wrap">
        <div className="team">
          <div className="portrait" data-reveal>
            <Image src="/v3/img/ceo-0.jpg" alt={s.portraitAlt} fill sizes="(max-width: 900px) 100vw, 52vw" />
          </div>
          <div style={{ display: 'grid', gap: 22 }}>
            <p className="k">
              <b>{s.kicker}</b>
            </p>
            <h2 id="company-title" style={{ fontSize: 'clamp(32px, 4.2vw, 58px)' }}>
              <Rich value={s.title} />
            </h2>
            <figure className="note">
              <blockquote>{s.quote}</blockquote>
              <figcaption>{s.quoteBy}</figcaption>
            </figure>
            <div>
              {s.people.map((p) => (
                <div key={p.name} className="person">
                  <b>{p.name}</b>
                  <span>{p.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ul className="offices">
          {s.offices.map((o) => (
            <li key={o.city} data-reveal>
              <b>{o.city}</b>
              <span>{o.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Cta({ t }: Props) {
  const s = t.cta;
  return (
    <section className="cta" id="contact" aria-labelledby="cta-title">
      <div className="wrap">
        <span className="sym">
          <Symbol gid={`cta-sym-${t.lang}`} />
        </span>
        <h2 id="cta-title">
          <Rich value={s.title} />
        </h2>
        <p className="lead">{s.lead}</p>
        <Link className="btn pri" href={bookHref(t)}>
          {s.button} <Arrow />
        </Link>
        <p className="mail">
          {s.or}{' '}
          <a href={`mailto:${STUDIO_EMAIL}`} lang="en" dir="ltr">
            {STUDIO_EMAIL}
          </a>
        </p>
      </div>
    </section>
  );
}

export function Footer({ t }: Props) {
  const s = t.footer;
  const home = t.lang === 'en' ? '/' : '/ar';
  const [terms, cookies] = s.rights.split(' · ');
  return (
    <footer className="f">
      <div className="wrap fcols">
        <div>
          <Link className="home" href={home} aria-label={t.nav.home}>
            <Lockup gid={`foot-sym-${t.lang}`} lang={t.lang} />
          </Link>
          <p className="line">{s.line}</p>
        </div>
        {s.cols.map((col) => (
          <div key={col.title}>
            <h2>{col.title}</h2>
            <ul>
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.external ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" lang="en">
                      {l.label}
                    </a>
                  ) : (
                    <a href={l.href}>{l.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="fbot">
        <div className="wrap">
          <span>
            © {new Date().getFullYear()} {s.legal}
          </span>
          <nav aria-label={t.lang === 'en' ? 'Legal' : 'قانوني'}>
            <a href="/terms">{terms}</a>
            <a href="/cookies">{cookies}</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
