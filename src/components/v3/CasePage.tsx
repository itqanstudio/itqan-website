import Image from 'next/image';
import Link from 'next/link';
import type { CaseDetail, SiteDict } from '@/content/v3/types';
import { Arrow, Rich } from './brand';
import { Quote, Stats } from './sections-company';
import { bookHref } from './sections';

export const CASE_SLUGS = ['millow', 'nexilink'] as const;
export type CaseSlug = (typeof CASE_SLUGS)[number];

export function isCaseSlug(slug: string): slug is CaseSlug {
  return (CASE_SLUGS as readonly string[]).includes(slug);
}

export function CasePage({ t, c }: { t: SiteDict; c: CaseDetail }) {
  const prefix = t.lang === 'en' ? '' : '/ar';
  const nextSlug = CASE_SLUGS[(CASE_SLUGS.indexOf(c.slug) + 1) % CASE_SLUGS.length];
  const next = t.cases[nextSlug];
  return (
    <article>
      <div className="wrap crumbs">
        <a href={`${prefix}/#work`}>
          <span className="arr" style={{ transform: t.dir === 'rtl' ? 'none' : 'scaleX(-1)' }} aria-hidden="true">
            →
          </span>{' '}
          {t.caseNav.back}
        </a>
      </div>
      <header className="chero">
        <div className="wrap">
          <p className="k">
            <b>{c.kicker}</b>
          </p>
          <h1>
            <Rich value={c.title} />
          </h1>
          <p className="lead">{c.lead}</p>
          <dl className="facts">
            {c.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>
      <section className="s" aria-label={c.briefTitle}>
        <div className="wrap" style={{ display: 'grid', gap: 'clamp(48px, 7vw, 96px)' }}>
          <figure className="cshot">
            <Image src={c.heroImage} alt={c.heroAlt} fill priority sizes="(max-width: 1240px) 100vw, 1144px" />
          </figure>
          <div className="cbody">
            <h2>{c.briefTitle}</h2>
            <div className="prose">
              {c.brief.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <div className="cbody">
            <h2>{c.didTitle}</h2>
            <ul className="dots" style={{ fontSize: 17 }}>
              {c.did.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div className="gallery">
            {c.gallery.map((g) => (
              <figure key={g.src} data-reveal>
                <Image src={g.src} alt={g.alt} fill sizes="(max-width: 760px) 100vw, 50vw" />
              </figure>
            ))}
          </div>
          <div className="cbody">
            <h2>{c.resultTitle}</h2>
            <div style={{ display: 'grid', gap: 24 }}>
              <Stats items={c.stats} className={c.stats.length === 4 ? 'four' : 'three'} />
              {c.quote && <Quote text={c.quote.text} by={c.quote.by} lang={t.lang} />}
            </div>
          </div>
          <div className="why" data-reveal>
            <h2>{c.whyTitle}</h2>
            <p>{c.why}</p>
          </div>
          <div className="cnext">
            <div className="btns">
              <Link className="btn pri" href={bookHref(t)}>
                {t.caseNav.cta} <Arrow />
              </Link>
              {c.external && (
                <a className="btn" href={c.external.href} target="_blank" rel="noopener noreferrer">
                  {c.external.label} ↗
                </a>
              )}
            </div>
            <Link className="btn" href={`${prefix}/work/${next.slug}`}>
              {t.caseNav.next}: <span lang="en">{next.slug === 'millow' ? 'Millow' : 'Nexilink'}</span> <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
