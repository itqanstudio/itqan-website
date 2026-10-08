'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { BlockedDate } from '@/lib/scheduling/types';
import { adminCall } from './api';

function longDate(ymd: string): string {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${ymd}T12:00:00Z`));
}

export function DaysOff({ initial, tz }: { initial: BlockedDate[]; tz: string }) {
  const router = useRouter();
  const [days, setDays] = useState(initial);
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const upcoming = days.filter((d) => d.date >= today);
  const old = days.filter((d) => d.date < today);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setBusy(true);
    setError(null);
    const res = await adminCall<BlockedDate[]>('/api/admin/blocked', 'POST', { date, note });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDays(res.data ?? []);
    setDate('');
    setNote('');
    router.refresh();
  };

  const remove = async (d: string) => {
    setBusy(true);
    const res = await adminCall<BlockedDate[]>(`/api/admin/blocked?date=${encodeURIComponent(d)}`, 'DELETE');
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDays(res.data ?? []);
    router.refresh();
  };

  return (
    <section className="adm-card" aria-labelledby="adm-off">
      <h2 id="adm-off">Days off</h2>
      <p className="adm-muted">Close a whole day: travel, Eid, a workshop. Existing bookings on that day stay; cancel them above if needed.</p>
      <form className="adm-off-form" onSubmit={add}>
        <label>
          <span>Date</span>
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          <span>Note (only you see it)</span>
          <input value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="Travel to Gothenburg" />
        </label>
        <button className="btn pri" type="submit" disabled={busy || !date}>
          Close this day
        </button>
      </form>
      {error && (
        <p className="bk-msg err" role="alert">
          {error}
        </p>
      )}
      {upcoming.length === 0 ? (
        <p className="adm-muted">No days off coming up.</p>
      ) : (
        <ul className="adm-offlist">
          {upcoming.map((d) => (
            <li key={d.date}>
              <b>{longDate(d.date)}</b>
              {d.note && <span>{d.note}</span>}
              <button type="button" className="btn" disabled={busy} onClick={() => void remove(d.date)}>
                Open again
              </button>
            </li>
          ))}
        </ul>
      )}
      {old.length > 0 && (
        <details className="adm-old">
          <summary>{old.length} past days off</summary>
          <ul className="adm-offlist">
            {old.map((d) => (
              <li key={d.date}>
                <b>{longDate(d.date)}</b>
                {d.note && <span>{d.note}</span>}
                <button type="button" className="btn" disabled={busy} onClick={() => void remove(d.date)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
