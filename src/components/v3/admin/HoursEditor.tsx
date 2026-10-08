'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIMITS, SLOT_MINUTE_OPTIONS, TIMEZONE_OPTIONS } from '@/lib/scheduling/config';
import { WEEKDAYS, type Availability, type TimeRange, type Weekday } from '@/lib/scheduling/types';
import { adminCall } from './api';

const DAY_NAMES: Record<Weekday, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

type NumKey = 'bufferMinutes' | 'minNoticeHours' | 'horizonDays' | 'maxPerDay';
const NUMBERS: { key: NumKey; label: string; hint: string }[] = [
  { key: 'bufferMinutes', label: 'Buffer (minutes)', hint: 'Kept free before and after each call' },
  { key: 'minNoticeHours', label: 'Notice (hours)', hint: 'How soon a slot can be booked' },
  { key: 'horizonDays', label: 'Booking window (days)', hint: 'How far ahead people can book' },
  { key: 'maxPerDay', label: 'Calls per day', hint: 'No more bookings once reached' },
];

export function HoursEditor({ initial }: { initial: Availability }) {
  const router = useRouter();
  const [a, setA] = useState<Availability>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const dirty = JSON.stringify(a) !== JSON.stringify(initial);

  const setDay = (day: Weekday, ranges: TimeRange[]) => setA((prev) => ({ ...prev, weekly: { ...prev.weekly, [day]: ranges } }));
  const setNum = (key: NumKey, value: string) => setA((prev) => ({ ...prev, [key]: Number.parseInt(value, 10) || 0 }));

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const res = await adminCall<Availability>('/api/admin/availability', 'PUT', a);
    setSaving(false);
    if (!res.ok) {
      setMessage({ kind: 'err', text: res.error });
      return;
    }
    setMessage({ kind: 'ok', text: 'Saved. The booking page uses these hours now.' });
    router.refresh();
  };

  return (
    <section className="adm-card" aria-labelledby="adm-hours">
      <h2 id="adm-hours">Weekly hours</h2>
      <p className="adm-muted">Times are in the studio time zone below. Add a second window for a lunch break. A day with no window is closed.</p>
      <div className="adm-week">
        {WEEKDAYS.map((day) => {
          const ranges = a.weekly[day];
          return (
            <div key={day} className="adm-day">
              <b>{DAY_NAMES[day]}</b>
              <div className="adm-ranges">
                {ranges.length === 0 && <span className="adm-muted">Closed</span>}
                {ranges.map((r, i) => (
                  <div key={i} className="adm-range">
                    <input type="time" step={300} value={r.start} aria-label={`${DAY_NAMES[day]} window ${i + 1} start`} onChange={(e) => setDay(day, ranges.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} />
                    <span aria-hidden="true">to</span>
                    <input type="time" step={300} value={r.end} aria-label={`${DAY_NAMES[day]} window ${i + 1} end`} onChange={(e) => setDay(day, ranges.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} />
                    <button type="button" className="adm-x" aria-label={`Remove ${DAY_NAMES[day]} window ${i + 1}`} onClick={() => setDay(day, ranges.filter((_, j) => j !== i))}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn adm-add"
                disabled={ranges.length >= LIMITS.rangesPerDay}
                onClick={() => setDay(day, [...ranges, ranges.length ? { start: '14:00', end: '17:00' } : { start: '10:00', end: '12:00' }])}
              >
                Add window
              </button>
            </div>
          );
        })}
      </div>

      <h3>Rules</h3>
      <div className="adm-rules">
        <label>
          <span>Studio time zone</span>
          <select value={a.timezone} onChange={(e) => setA((p) => ({ ...p, timezone: e.target.value }))}>
            {Array.from(new Set([a.timezone, ...TIMEZONE_OPTIONS])).map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Call length (minutes)</span>
          <select value={a.slotMinutes} onChange={(e) => setA((p) => ({ ...p, slotMinutes: Number(e.target.value) }))}>
            {SLOT_MINUTE_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        {NUMBERS.map((n) => (
          <label key={n.key}>
            <span>{n.label}</span>
            <input type="number" inputMode="numeric" min={LIMITS[n.key].min} max={LIMITS[n.key].max} value={a[n.key]} onChange={(e) => setNum(n.key, e.target.value)} />
            <small className="adm-muted">{n.hint}</small>
          </label>
        ))}
      </div>
      {message && (
        <p className={`bk-msg ${message.kind}`} role="status">
          {message.text}
        </p>
      )}
      <div className="btns">
        <button type="button" className="btn pri" disabled={!dirty || saving} onClick={() => void save()}>
          {saving ? 'Saving…' : 'Save hours and rules'}
        </button>
        <button type="button" className="btn" disabled={!dirty || saving} onClick={() => setA(initial)}>
          Undo changes
        </button>
      </div>
    </section>
  );
}
