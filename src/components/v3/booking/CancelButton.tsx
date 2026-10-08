'use client';

import { useState } from 'react';
import type { BookingCopy } from '@/content/v3/booking';

interface CancelButtonProps {
  token: string;
  t: BookingCopy['cancel'];
  rebook: string;
  fallbackError: string;
}

export function CancelButton({ token, t, rebook, fallbackError }: CancelButtonProps) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const cancel = async () => {
    setState('busy');
    try {
      const res = await fetch('/api/book/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (res.ok && body.ok) {
        setState('done');
        return;
      }
      setMessage(body.error === 'past' ? t.past : body.error === 'not_found' ? t.notFound : null);
      setState('error');
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div className="bk-done" role="status">
        <h2>{t.doneTitle}</h2>
        <p>{t.doneBody}</p>
        <a className="btn pri" href={rebook}>
          {t.rebook}
        </a>
      </div>
    );
  }
  return (
    <div className="btns">
      <button type="button" className="btn pri" onClick={() => void cancel()} disabled={state === 'busy'} aria-busy={state === 'busy'}>
        {state === 'busy' ? t.working : t.button}
      </button>
      {state === 'error' && (
        <p className="bk-msg err" role="alert">
          {message ?? fallbackError}
        </p>
      )}
    </div>
  );
}
