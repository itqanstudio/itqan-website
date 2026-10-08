import Link from 'next/link';
import type { SiteDict } from '@/content/v3/types';
import { isIconName } from '@/lib/v3/brand';
import { Arrow, PixelIcon, Rich } from './brand';
import { PixelField } from './PixelField';
import { AgentRun } from './AgentRun';

interface Props {
  t: SiteDict;
}

function bookHref(t: SiteDict, topic?: string): string {
  const base = t.lang === 'en' ? '/book' : '/ar/book';
  return topic ? `${base}?topic=${topic}` : base;
}

export function Hero({ t }: Props) {
  const h = t.hero;
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap">
        <div className="txt">
          <p className="k">
            <b>{h.kicker.split(' · ')[0]}</b>
            {h.kicker.includes(' · ') ? ` · ${h.kicker.split(' · ').slice(1).join(' · ')}` : ''}
          </p>
          <h1 id="hero-title">
            <Rich value={h.title} />
          </h1>
          <p className="lead">{h.lead}</p>
          <div className="btns">
            <Link className="btn pri" href={bookHref(t)}>
              {h.primary} <Arrow />
            </Link>
            <a className="btn" href="#security">
              {h.secondary}
            </a>
          </div>
          <ul className="meta">
            {h.meta.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
        <PixelField label={h.canvasLabel} hint={h.hint} />
      </div>
    </section>
  );
}

export function Strip({ t }: Props) {
  return (
    <div className="wrap">
      <ul className="strip" aria-label={t.strip.label}>
        <li className="lab" aria-hidden="true">
          {t.strip.label}
        </li>
        {t.strip.items.map((s) => (
          <li key={s} className="v" lang={/[a-z]/i.test(s) ? 'en' : undefined}>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Head({ kicker, title, lead, id }: { kicker: string; title: SiteDict['industries']['title']; lead?: string; id: string }) {
  return (
    <div className="head">
      <p className="k">
        <b>{kicker}</b>
      </p>
      <h2 id={id} data-reveal>
        <Rich value={title} />
      </h2>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}

export function Industries({ t }: Props) {
  const s = t.industries;
  return (
    <section className="s" id="industries" aria-labelledby="ind-title">
      <div className="wrap">
        <Head id="ind-title" kicker={s.kicker} title={s.title} lead={s.lead} />
        <div className="ind">
          {s.items.map((it) => (
            <article key={it.key} className={it.focus ? 'focus' : undefined} data-reveal>
              {it.focus && <span className="badge">{s.focus}</span>}
              <PixelIcon name={it.icon} treatment="tile" />
              <h3>{it.title}</h3>
              <p className="sub">{it.sub}</p>
              <ul className="dots">
                {it.items.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
              <p className="first">{it.first}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RunSection({ t }: Props) {
  const s = t.run;
  return (
    <section className="s" id="run" aria-labelledby="run-title">
      <div className="wrap run">
        <Head id="run-title" kicker={s.kicker} title={s.title} lead={s.lead} />
        <AgentRun t={s} />
      </div>
    </section>
  );
}

export function Build({ t }: Props) {
  const s = t.build;
  return (
    <section className="s" id="build" aria-labelledby="build-title">
      <div className="wrap">
        <Head id="build-title" kicker={s.kicker} title={s.title} />
        <div className="tiles">
          {s.tiles.map((tile, i) => (
            <div key={tile.title} data-reveal>
              {isIconName(tile.icon) && <PixelIcon name={tile.icon} treatment="grad" gid={`build-ic-${i}`} />}
              <h3>{tile.title}</h3>
              <p>{tile.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Security({ t }: Props) {
  const s = t.security;
  const f = s.flow;
  return (
    <section className="s sec" id="security" aria-labelledby="sec-title">
      <div className="wrap">
        <Head id="sec-title" kicker={s.kicker} title={s.title} lead={s.lead} />
        <ol className="flow" aria-label={f.label}>
          <li className="node" data-reveal>
            <PixelIcon name="buildings" />
            <h3>{f.systems.title}</h3>
            <ul className="chips">
              {f.systems.chips.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </li>
          <li className="ar2" aria-hidden="true">
            →
          </li>
          <li className="node core" data-reveal>
            <PixelIcon name="server" treatment="grad" gid="flow-core" />
            <h3>{f.core.title}</h3>
            <ul className="chips">
              {f.core.chips.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p>{f.core.note}</p>
          </li>
          <li className="ar2" aria-hidden="true">
            →
          </li>
          <li className="node" data-reveal>
            <PixelIcon name="users" />
            <h3>{f.people.title}</h3>
            <ul className="chips">
              {f.people.chips.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </li>
        </ol>
        <div className="ctrl">
          {s.controls.map((c, i) => (
            <div key={c.title} data-reveal>
              {isIconName(c.icon) && <PixelIcon name={c.icon} treatment="grad" gid={`ctrl-ic-${i}`} />}
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
        <div className="review">
          <p>{s.review}</p>
          <Link className="btn" href={bookHref(t, 'security')}>
            {s.reviewCta} <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function How({ t }: Props) {
  const s = t.how;
  return (
    <section className="s" id="how" aria-labelledby="how-title">
      <div className="wrap">
        <Head id="how-title" kicker={s.kicker} title={s.title} />
        <ol className="steps">
          {s.steps.map((st, i) => (
            <li key={st.n} className={i === 0 ? 'step on' : 'step'} data-reveal>
              <span className="num" aria-hidden="true">
                {st.n}
              </span>
              <h3>{st.title}</h3>
              <p>{st.body}</p>
              <span className="t">{st.meta}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Faq({ t }: Props) {
  const s = t.faq;
  return (
    <section className="s" id="faq" aria-labelledby="faq-title">
      <div className="wrap">
        <Head id="faq-title" kicker={s.kicker} title={s.title} />
        <div className="faq">
          {s.items.map((it) => (
            <details key={it.q}>
              <summary>{it.q}</summary>
              <p className="a">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export { bookHref };
