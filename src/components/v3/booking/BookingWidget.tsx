'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { BookingCopy } from '@/content/v3/booking';
import { localHostName, splitAt } from '@/content/v3/booking-format';
import type { WidgetSlots } from '@/lib/crm/widget-slots';
import { buildIcs } from '@/lib/scheduling/ics';
import { failureMessage, loadSlots, postBooking, slotsReady, type Booked, type SlotsLoad } from './booking-api';
import { SlotPicker } from './SlotPicker';
import { DetailsForm, EMPTY_DETAILS, type Details } from './DetailsForm';
import { COMMON_ZONES, detectZone, longLabel } from './slots-view';

interface BookingWidgetProps {
  t: BookingCopy;
  lang: 'en' | 'ar';
  topic: 'briefing' | 'security';
  /** Restricts the free times and the booking to one host (`/book?with=<slug>`). */
  withSlug?: string;
  /** Free times fetched while the page rendered; null makes the widget load them itself. */
  initial: WidgetSlots | null;
}

type Load = { state: 'loading' } | SlotsLoad;
type Step = 'pick' | 'details' | 'done';
type Done = Booked & { email: string };

/** The studio address on the downloaded file; the emailed invite names the host's own address. */
const ICS_ORGANIZER = 'hello@itqanstudio.com';
const SPRING = { type: 'spring', stiffness: 320, damping: 32 } as const;
const FADE = { duration: 0.15 } as const;

/** "Your call is with {host}." with the name isolated for right-to-left text. */
function WithName({ template, name }: { template: string; name: string }) {
  const [before, after] = splitAt(template, 'host');
  return (
    <>
      {before}
      <bdi>{name}</bdi>
      {after}
    </>
  );
}

function downloadIcs(done: Done, t: BookingCopy): void {
  const ics = buildIcs({
    // Same UID as the emailed invite, so a calendar treats both as one event.
    uid: `${done.id}@itqanstudio.com`,
    start: new Date(done.start),
    end: new Date(done.end),
    summary: t.done.calendarTitle,
    description: t.done.sent,
    organizerEmail: ICS_ORGANIZER,
    organizerName: done.hostName,
    method: 'PUBLISH',
    sequence: 0,
  });
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'itqan-briefing.ics';
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function DoneView({ t, lang, tz, done }: { t: BookingCopy; lang: 'en' | 'ar'; tz: string; done: Done }) {
  return (
    <>
      <h2>{t.done.title}</h2>
      <p>
        <WithName template={t.done.body} name={done.hostName} /> <b>{longLabel(done.start, tz, lang)}</b> ({tz.replace(/_/g, ' ')}).
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
        <button type="button" className="btn pri" onClick={() => downloadIcs(done, t)}>
          {t.done.calendar}
        </button>
        <a className="btn" href={lang === 'en' ? '/' : '/ar'}>
          {t.done.home}
        </a>
      </div>
    </>
  );
}

export function BookingWidget({ t, lang, topic, withSlug, initial }: BookingWidgetProps) {
  const reduce = useReducedMotion();
  const [load, setLoad] = useState<Load>(initial ? slotsReady(initial) : { state: 'loading' });
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
    setLoad(await loadSlots(withSlug));
  }, [withSlug]);

  // On mount: both inputs are fixed for the life of the widget, so this runs once.
  // Later loads come from Try again or a taken time.
  useEffect(() => {
    setTz(detectZone());
    if (!initial) void fetchSlots();
  }, [fetchSlots, initial]);

  // Move focus to the top of the widget on every step change, for keyboard and screen reader users.
  useEffect(() => {
    if (step !== 'pick' || done) headRef.current?.focus({ preventScroll: false });
  }, [step, done]);

  const submit = async () => {
    if (!selected) return;
    setBusy(true);
    setError(null);
    const outcome = await postBooking({ ...details, start: selected, locale: lang, timezone: tz, topic, ...(withSlug ? { with: withSlug } : {}) });
    setBusy(false);
    if (outcome.kind === 'booked') {
      setDone({ ...outcome.booked, email: details.email.trim() });
      setStep('done');
    } else if (outcome.kind === 'taken') {
      setSelected(null);
      setNotice(t.errors.taken);
      setStep('pick');
      void fetchSlots();
    } else {
      setError(failureMessage(t.errors, outcome.reason));
    }
  };

  const zones = Array.from(new Set([tz, ...COMMON_ZONES]));
  // Same animated properties either way, so the server render (which cannot know the setting)
  // hydrates cleanly; reduced motion keeps a short fade and drops the movement.
  const motionProps = reduce
    ? { initial: { opacity: 0, y: 0 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 0 }, transition: FADE }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: SPRING };
  const onlyHost = withSlug && load.state === 'ready' && load.hosts.length === 1 ? load.hosts[0] : null;

  return (
    <div className="bk-card">
      <div className="bk-head" ref={headRef} tabIndex={-1}>
        {step !== 'done' && onlyHost && (
          <p className="bk-with">
            <WithName template={t.withHost} name={localHostName(onlyHost, lang)} />
          </p>
        )}
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
            {(load.state === 'error' || load.state === 'paused') && (
              <div className="bk-empty" role="alert">
                <p>{load.state === 'paused' ? t.paused : t.loadError}</p>
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
            <DoneView t={t} lang={lang} tz={tz} done={done} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
