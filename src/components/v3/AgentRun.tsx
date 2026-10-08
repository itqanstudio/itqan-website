'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { SiteDict } from '@/content/v3/types';

interface AgentRunProps {
  t: SiteDict['run'];
}

const STEP_MS = 900;

/**
 * One example run per industry, played step by step when the box scrolls into
 * view. Switching tabs or pressing replay restarts at once, so the demo never
 * has to finish before it responds. Reduced motion shows every step at once.
 */
export function AgentRun({ t }: AgentRunProps) {
  const [active, setActive] = useState(0);
  // The server renders the whole run, so the page reads complete without JavaScript.
  const [shown, setShown] = useState(t.runs[0].steps.length);
  const [nonce, setNonce] = useState(0);
  const [armed, setArmed] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(boxRef, { amount: 0.35 });
  const reduce = useReducedMotion();
  const run = t.runs[active];
  const total = run.steps.length;

  /*
   * Server-rendered steps carry no inline opacity, so the run reads complete
   * before hydration and for reduced-motion users (React does not patch style
   * attributes during hydration). Only after mount, and only with motion
   * allowed, are steps hidden and replayed one by one.
   */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setShown(0);
  }, []);

  // Arm once: scrolling away later never cancels a run halfway.
  useEffect(() => {
    if (inView) setArmed(true);
  }, [inView]);

  useEffect(() => {
    if (reduce) {
      setShown(total);
      return;
    }
    if (!armed) return;
    setShown(1);
    let n = 1;
    const id = window.setInterval(() => {
      n += 1;
      setShown(Math.min(n, total));
      if (n >= total) window.clearInterval(id);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [active, nonce, armed, reduce, total]);

  const select = (i: number) => {
    setActive(i);
    setNonce((v) => v + 1);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const rtl = document.documentElement.dir === 'rtl';
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const n = t.runs.length;
    let next = active;
    if (e.key === fwd) next = (active + 1) % n;
    if (e.key === back) next = (active - 1 + n) % n;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = n - 1;
    select(next);
    tabRefs.current[next]?.focus();
  };

  const done = shown >= total;

  return (
    <div>
      <div className="tabs" role="tablist" aria-label={t.kicker} onKeyDown={onKey}>
        {t.runs.map((r, i) => (
          <button
            key={r.key}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`run-tab-${r.key}`}
            aria-selected={i === active}
            aria-controls="run-panel"
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
          >
            {r.tab}
          </button>
        ))}
      </div>
      <div className="runbox" ref={boxRef} role="tabpanel" id="run-panel" aria-labelledby={`run-tab-${run.key}`}>
        <div className="bar">
          <h3>{run.title}</h3>
          {done ? <span className="pulse">{t.waiting}</span> : <span className="k">{`${shown}/${total}`}</span>}
        </div>
        <ol aria-live="polite">
          {run.steps.slice(0, shown).map((s) => (
            <motion.li
              key={`${run.key}-${nonce}-${s.time}-${s.verb}`}
              className={s.waits ? 'wait' : undefined}
              initial={hydrated && !reduce ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            >
              <span className="t">{s.time}</span>
              <span className="v">{s.verb}</span>
              <span className="txt">{s.text}</span>
            </motion.li>
          ))}
        </ol>
        <div className="foot">
          <span>{t.note}</span>
          <button type="button" onClick={() => setNonce((v) => v + 1)} disabled={!done}>
            {t.replay}
          </button>
        </div>
      </div>
    </div>
  );
}
