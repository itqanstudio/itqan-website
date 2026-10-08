'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { BookingCopy } from '@/content/v3/booking';
import { buildIcs } from '@/lib/scheduling/ics';
import { SlotPicker } from './SlotPicker';
import { DetailsForm, EMPTY_DETAILS, type Details } from './DetailsForm';
import { COMMON_ZONES, detectZone, longLabel } from './slots-view';

interface BookingWidgetProps {
  t: BookingCopy;
  lang: 'en' | 'ar';
  topic: 'briefing' | 'security';
}

type Load = { state: 'loading' } | { state: 'error' } | { state: 'ready'; slots: string[] };
type Step = 'pick' | 'details' | 'done';
interface Done {
  id: string;
  start: string;
  end: string;
  email: string;
  emailed: boolean;
}

const SPRING = { type: 'spring', stiffness: 320, damping: 32 } as const;

export function BookingWidget({ t, lang, topic }: BookingWidgetProps) {
  const reduce = useReducedMotion();
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [tz, setTz] = useState('UTC');
  const [step, setStep] = useState<Step>('pick');
  const [selected, setSelected] = useState<string | null>(null);
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const headRef = useRef<HTMLDivElement>(null);

  const fetchSlots = useCallback(async () => {
    setLoad({ state: 'loading' });
    try {
      const res = await fetch('/api/book/slots', { cache: 'no-store' });
      const body = (await res.json()) as { ok: boolean; data?: { slots: string[] } };
      if (!res.ok || !body.ok || !body.data) throw new Error('load');
      setLoad({ state: 'ready', slots: body.data.slots });
    } catch {
      setLoad({ state: 'error' });
    }
  }, []);

  useEffect(() => {
    setTz(detectZone());
    void fetchSlots();
  }, [fetchSlots]);

  // Move focus to the top of the widget on every step change, for keyboard and screen reader users.
  useEffect(() => {
    if (step !== 'pick' || done) headRef.current?.focus({ preventScroll: false });
  }, [step, done]);

  const submit = async () => {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...details, start: selected, locale: lang, timezone: tz, topic }),
      });
      const body = (await res.json()) as { ok: boolean; error?: string; data?: { id: string; start: string; end: string; emailed: boolean } };
      if (res.ok && body.ok && body.data) {
        setDone({ ...body.data, email: details.email.trim() });
        setStep('done');
        return;
      }
      if (res.status === 409) {
        setSelected(null);
        setNotice(t.errors.taken);
        setStep('pick');
        void fetchSlots();
        return;
      }
      if (body.error === 'limit') setError(t.errors.limit);
      else setError(res.status === 429 ? t.errors.rate : res.status === 400 ? t.errors.invalid : t.errors.server);
    } catch {
      setError(t.errors.network);
    } finally {
      setBusy(false);
    }
  };

  const downloadIcs = () => {
    if (!done) return;
    const ics = buildIcs({
      // Same UID as the emailed invite, so a calendar treats both as one event.
      uid: `${done.id}@itqanstudio.com`,
      start: new Date(done.start),
      end: new Date(done.end),
      summary: lang === 'en' ? 'Itqan briefing' : 'جلسة تعريفية مع إتقان',
      description: t.done.sent,
      organizerEmail: 'ibrahim@itqanstudio.com',
      method: 'PUBLISH',
      sequence: 0,
    });
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'itqan-briefing.ics';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const zones = Array.from(new Set([tz, ...COMMON_ZONES]));
  const motionProps = reduce
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: SPRING };

  return (
    <div className="bk-card">
      <div className="bk-head" ref={headRef} tabIndex={-1}>
        {step !== 'done' && (
          <label className="bk-tz">
            <span>{t.tzLabel}</span>
            <select value={tz} onChange={(e) => setTz(e.target.value)} aria-label={t.tzChange} dir="ltr">
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {step === 'pick' && (
          <motion.div key="pick" {...motionProps}>
            {load.state === 'loading' && <p className="bk-empty" aria-live="polite">{t.loading}</p>}
            {load.state === 'error' && (
              <div className="bk-empty" role="alert">
                <p>{t.loadError}</p>
                <button type="button" className="btn" onClick={() => void fetchSlots()}>
                  {t.retry}
                </button>
              </div>
            )}
            {load.state === 'ready' && (
              <SlotPicker
                t={t}
                lang={lang}
                slots={load.slots}
                tz={tz}
                selected={selected}
                notice={notice}
                onPick={(iso) => {
                  setSelected(iso);
                  setNotice(null);
                  setStep('details');
                }}
              />
            )}
          </motion.div>
        )}
        {step === 'details' && selected && (
          <motion.div key="details" {...motionProps}>
            <div className="bk-chosen">
              <div>
                <span className="bk-step">{t.selected}</span>
                <b>{longLabel(selected, tz, lang)}</b>
              </div>
              <button type="button" className="btn" onClick={() => setStep('pick')}>
                {t.back}
              </button>
            </div>
            <DetailsForm t={t} lang={lang} value={details} busy={busy} error={error} onChange={setDetails} onSubmit={() => void submit()} />
          </motion.div>
        )}
        {step === 'done' && done && (
          <motion.div key="done" className="bk-done" {...motionProps} aria-live="polite">
            <h2>{t.done.title}</h2>
            <p>
              {t.done.body} <b>{longLabel(done.start, tz, lang)}</b> ({tz.replace(/_/g, ' ')}).
            </p>
            {done.emailed ? (
              <p>
                {t.done.sent}{' '}
                <b dir="ltr" lang="en">
                  {done.email}
                </b>
                .
              </p>
            ) : (
              <p className="bk-msg err" role="alert">
                {t.done.emailFailed}
              </p>
            )}
            <div className="btns">
              <button type="button" className="btn pri" onClick={downloadIcs}>
                {t.done.calendar}
              </button>
              <a className="btn" href={lang === 'en' ? '/' : '/ar'}>
                {t.done.home}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
