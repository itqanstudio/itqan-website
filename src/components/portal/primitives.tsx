import type { ReactNode } from 'react';
import type { BrandAsset } from '@/components/portal/types';
import type { CopyItem, Swatch } from '@/data/brand-spec';
import { CopyButton } from './CopyButton';

export function PageHead({ kicker, title, lead }: { kicker: string; title: ReactNode; lead?: ReactNode }) {
  return (
    <header className="ph">
      <p className="k">
        <b>{kicker}</b>
      </p>
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
    </header>
  );
}

export function Section({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section className="pt-sec" id={id} aria-label={title}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function Swatches({ items }: { items: readonly Swatch[] }) {
  return (
    <div className="pt-swatches">
      {items.map((s) => (
        <div key={s.name + s.hex} className="pt-swatch">
          <div className="chip" style={{ background: s.hex, color: s.fg }}>
            Aa
          </div>
          <div className="info">
            <b>{s.name}</b>
            <span className="hex">{s.hex}</span>
            <p>{s.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export interface Rule {
  title: string;
  body: string;
  kind?: 'yes' | 'no';
}

export function Rules({ items }: { items: readonly Rule[] }) {
  return (
    <ul className="pt-rules">
      {items.map((r) => (
        <li key={r.title} className={r.kind}>
          <b>{r.title}</b>
          <span>{r.body}</span>
        </li>
      ))}
    </ul>
  );
}

export function CopyBlock({ item }: { item: CopyItem }) {
  // Arabic only when the line starts in Arabic; an English line that quotes إتقان stays left to right.
  const arabic = /^[؀-ۿ]/.test(item.text);
  return (
    <div className="pt-copy">
      <div className="bar">
        <div>
          <b>{item.label}</b>
          <span>{item.meta}</span>
        </div>
        <CopyButton text={item.text} />
      </div>
      <p lang={arabic ? 'ar' : undefined}>{item.text}</p>
    </div>
  );
}

const fmtBytes = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/** Marks drawn in ink need a light tile to be seen; the filename says which. */
function wantsLightTile(a: BrandAsset): boolean {
  return /(^|-)(ink|light|dark-on)(-|$)/.test(a.slug);
}

export function AssetGrid({ assets }: { assets: readonly BrandAsset[] }) {
  if (assets.length === 0) return <p className="lead">Nothing in this set yet.</p>;
  return (
    <div className="pt-assets">
      {assets.map((a) => (
        <figure key={a.id} className="pt-asset">
          <div className={`thumb${wantsLightTile(a) ? ' light' : ''}`}>
            {a.src && !a.sourceOnly ? (
              // Plain img: these are the exact files people download, at their real size.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.src} alt={a.name} loading="lazy" width={a.width} height={a.height} />
            ) : (
              <span className="pt-cap">Source on request</span>
            )}
          </div>
          <figcaption className="info">
            <b>{a.name}</b>
            <span>
              {a.format}
              {a.width && a.height ? ` · ${a.width} × ${a.height}` : ''} · {fmtBytes(a.bytes)}
            </span>
            {a.src && !a.sourceOnly && (
              <a href={a.src} download>
                Download
              </a>
            )}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
