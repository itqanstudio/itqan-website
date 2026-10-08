'use client';

import { useEffect, useMemo, useState } from 'react';
import type { BookingCopy } from '@/content/v3/booking';
import { dayLabel, groupByDay, timeLabel, type DayGroup } from './slots-view';

interface SlotPickerProps {
  t: BookingCopy;
  lang: 'en' | 'ar';
  slots: readonly string[];
  tz: string;
  selected: string | null;
  notice?: string | null;
  onPick: (iso: string) => void;
}

const PAGE = 7;

export function SlotPicker({ t, lang, slots, tz, selected, notice, onPick }: SlotPickerProps) {
  const days: DayGroup[] = useMemo(() => groupByDay(slots, tz), [slots, tz]);
  const [dayIdx, setDayIdx] = useState(0);
  const [page, setPage] = useState(0);

  // Keep the chosen day valid when the slots or the time zone change.
  useEffect(() => {
    const keep = selected ? days.findIndex((d) => d.slots.includes(selected)) : -1;
    const next = keep >= 0 ? keep : 0;
    setDayIdx(next);
    setPage(Math.floor(next / PAGE));
  }, [days, selected]);

  if (days.length === 0) return <p className="bk-empty">{t.noSlots}</p>;

  const pages = Math.ceil(days.length / PAGE);
  const visible = days.slice(page * PAGE, page * PAGE + PAGE);
  const day = days[Math.min(dayIdx, days.length - 1)];

  return (
    <div className="bk-pick">
      <div className="bk-step">{t.steps.day}</div>
      <div className="bk-days-wrap">
        <button type="button" className="bk-page" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label={t.prevWeek}>
          <span className="arr" style={{ transform: lang === 'ar' ? 'none' : 'scaleX(-1)' }} aria-hidden="true">
            →
          </span>
        </button>
        <div className="bk-days" role="group" aria-label={t.steps.day}>
          {visible.map((d) => {
            const i = days.indexOf(d);
            const l = dayLabel(d.ymd, lang);
            return (
              <button key={d.ymd} type="button" aria-pressed={i === dayIdx} className="bk-day" onClick={() => setDayIdx(i)}>
                <span className="w">{l.weekday}</span>
                <span className="d">{l.day}</span>
                <span className="m">{l.month}</span>
              </button>
            );
          })}
        </div>
        <button type="button" className="bk-page" onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1} aria-label={t.nextWeek}>
          <span className="arr" style={{ transform: lang === 'ar' ? 'scaleX(-1)' : 'none' }} aria-hidden="true">
            →
          </span>
        </button>
      </div>
      <div className="bk-step">{t.steps.time}</div>
      {notice && (
        <p className="bk-msg err" role="alert">
          {notice}
        </p>
      )}
      <div className="bk-times">
        {day.slots.map((s) => (
          <button key={s} type="button" className="bk-time" aria-pressed={s === selected} onClick={() => onPick(s)}>
            {timeLabel(s, tz, lang)}
          </button>
        ))}
      </div>
    </div>
  );
}
