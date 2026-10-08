import type { ReactNode } from 'react';
import { DUSK_STOPS, ICONS, INK, BONE, ROSE, SYMBOL_RECTS, type IconName } from '@/lib/v3/brand';
import type { Heading } from '@/content/v3/types';

/*
 * Gradient ids must be unique per document. They are passed in by the caller
 * instead of generated, so a server render and a client hydration always agree.
 */

interface SymbolProps {
  gid: string;
  /** dusk: the full-colour symbol. bone: one-colour on dark, rose dot. */
  tone?: 'dusk' | 'bone';
  title?: string;
  className?: string;
}

export function Symbol({ gid, tone = 'dusk', title, className }: SymbolProps) {
  const fill = tone === 'dusk' ? `url(#${gid})` : BONE;
  return (
    <svg
      viewBox="0 0 10 12"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {tone === 'dusk' && (
        <defs>
          <radialGradient id={gid} cx="0" cy="12" r="13.4" gradientUnits="userSpaceOnUse">
            {DUSK_STOPS.map(([offset, color]) => (
              <stop key={offset} offset={offset} stopColor={color} />
            ))}
          </radialGradient>
        </defs>
      )}
      {SYMBOL_RECTS.map(([x, y, w], i) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={1} fill={i === 0 ? ROSE : fill} />
      ))}
    </svg>
  );
}

/** The lowercase wordmark. The i is drawn: a stem and a square rose tittle. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`wm ${className ?? ''}`} aria-hidden="true">
      <b className="ii" />
      tqan
    </span>
  );
}

interface LockupProps {
  gid: string;
  lang: 'en' | 'ar';
  className?: string;
}

/** Symbol plus name. In Arabic the name is إتقان, and the symbol still never mirrors. */
export function Lockup({ gid, lang, className }: LockupProps) {
  return (
    <span className={`lock ${className ?? ''}`}>
      <span className="sym">
        <Symbol gid={gid} />
      </span>
      {lang === 'ar' ? (
        <span className="wm-ar" aria-hidden="true">
          إتقان
        </span>
      ) : (
        <Wordmark />
      )}
    </span>
  );
}

interface PixelIconProps {
  name: IconName;
  gid?: string;
  /** tile: ink glyph on a dusk tile. grad: dusk glyph. line: bone glyph. */
  treatment?: 'tile' | 'grad' | 'line';
  className?: string;
}

export function PixelIcon({ name, gid, treatment = 'line', className }: PixelIconProps) {
  const grad = treatment === 'grad' && gid;
  const fill = treatment === 'tile' ? INK : grad ? `url(#${gid})` : BONE;
  const svg = (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      className={treatment === 'tile' ? undefined : className}
    >
      {grad && (
        <defs>
          <linearGradient id={gid} x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
            {DUSK_STOPS.map(([offset, color]) => (
              <stop key={offset} offset={offset} stopColor={color} />
            ))}
          </linearGradient>
        </defs>
      )}
      {ICONS[name].map((d) => (
        <path key={d} d={d} fill={fill} />
      ))}
    </svg>
  );
  if (treatment !== 'tile') return svg;
  return <span className={`ic-tile ${className ?? ''}`}>{svg}</span>;
}

/** [before, highlighted, after]: the highlight renders in the dusk gradient. */
export function Rich({ value }: { value: Heading }): ReactNode {
  const [before, highlight, after] = value;
  return (
    <>
      {before}
      <span className="g">{highlight}</span>
      {after}
    </>
  );
}

/** The arrow that turns around in right-to-left layouts. */
export function Arrow() {
  return (
    <span className="arr" aria-hidden="true">
      →
    </span>
  );
}
