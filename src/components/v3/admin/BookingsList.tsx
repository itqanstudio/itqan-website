'use client';

import { useState } from 'react';
import type { Booking } from '@/lib/scheduling/types';
import { adminCall, fmtInZone } from './api';

interface BookingsListProps {
  title: string;
  bookings: Booking[];
  tz: string;
  cancellable?: boolean;
  collapsed?: boolean;
}

const INDUSTRY: Record<Booking['industry'], string> = { manufacturing: 'Manufacturing', retail: 'Retail', fnb: 'Food and beverage', other: 'Other' };

export function BookingsList({ title, bookings, tz, cancellable = false, collapsed = false }: BookingsListProps) {
  const [rows, setRows] = useState(bookings);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const confirmed = rows.filter((b) => b.status === 'confirmed').length;

  const cancel = async (b: Booking) => {
    setBusy(true);
    const res = await adminCall<{ changed: boolean; emailed: boolean }>('/api/admin/bookings/cancel', 'POST', { id: b.id, notify });
    setBusy(false);
    setConfirming(null);
    if (!res.ok) {
      setMessage({ kind: 'err', text: res.error });
      return;
    }
    setRows((list) => list.map((r) => (r.id === b.id ? { ...r, status: 'cancelled', cancelledBy: 'admin' } : r)));
    const mailed = notify ? (res.data?.emailed ? ` ${b.name} was emailed.` : ` The email to ${b.name} did not send; tell them yourself.`) : '';
    setMessage({ kind: res.data?.emailed || !notify ? 'ok' : 'err', text: `Cancelled ${b.company}.${mailed}` });
  };

  const body = (
    <>
      {message && (
        <p className={`bk-msg ${message.kind}`} role="status">
          {message.text}
        </p>
      )}
      {rows.length === 0 ? (
        <p className="adm-muted">Nothing here yet.</p>
      ) : (
        <ul className="adm-list">
          {rows.map((b) => (
            <li key={b.id} className={b.status === 'cancelled' ? 'off' : undefined}>
              <div className="when">
                <b>{fmtInZone(b.startUtc, tz, { weekday: 'short', day: 'numeric', month: 'short' })}</b>
                <span>{fmtInZone(b.startUtc, tz, { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                {b.status === 'cancelled' && <em>Cancelled by {b.cancelledBy ?? 'unknown'}</em>}
              </div>
              <div className="who">
                <b>
                  {b.name} · {b.company}
                </b>
                <span>
                  <a href={`mailto:${b.email}`}>{b.email}</a>
                  {b.role ? ` · ${b.role}` : ''} · {INDUSTRY[b.industry]} · {b.locale.toUpperCase()}
                  {b.topic === 'security' ? ' · security review' : ''}
                </span>
                <span className="adm-muted">Their time: {fmtInZone(b.startUtc, b.timezone, { hour: '2-digit', minute: '2-digit', hour12: false })} {b.timezone}</span>
                {b.message && <p>{b.message}</p>}
              </div>
              {cancellable && b.status === 'confirmed' && (
                <div className="act">
                  {confirming === b.id ? (
                    <div className="adm-confirm">
                      <label>
                        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Email {b.name.split(' ')[0]}
                      </label>
                      <button type="button" className="btn pri" disabled={busy} onClick={() => void cancel(b)}>
                        {busy ? 'Cancelling…' : 'Yes, cancel'}
                      </button>
                      <button type="button" className="btn" onClick={() => setConfirming(null)}>
                        Keep
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="btn" onClick={() => setConfirming(b.id)}>
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <section className="adm-card" aria-label={title}>
      {collapsed ? (
        <details>
          <summary>
            <h2>
              {title} <span className="adm-count">{rows.length}</span>
            </h2>
          </summary>
          {body}
        </details>
      ) : (
        <>
          <h2>
            {title} <span className="adm-count">{confirmed}</span>
          </h2>
          {body}
        </>
      )}
    </section>
  );
}
