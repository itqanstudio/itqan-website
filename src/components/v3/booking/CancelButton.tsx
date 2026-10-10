'use client';

import { useState } from 'react';
import type { BookingCopy } from '@/content/v3/booking';
import { fill, formatWhen } from '@/content/v3/booking-format';
import type { Lang } from '@/content/v3/types';

interface CancelButtonProps {
  token: string;
  lang: Lang;
  t: BookingCopy['cancel'];
  rebook: string;
  errors: { server: string; paused: string; network: string };
}

type State =
  | { kind: 'idle' }
  | { kind: 'busy' }
  | { kind: 'done'; message: string }
  | { kind: 'final'; message: string }
  | { kind: 'error'; message: string };

interface Answer {
  ok: boolean;
  error?: string;
  data?: { changed: boolean; start?: string; timezone?: string };
}

function cancelledMessage(t: BookingCopy['cancel'], lang: Lang, data: NonNullable<Answer['data']>): string {
  if (!data.changed) return t.already;
  if (!data.start || !data.timezone) return t.doneBodyNoTime;
  try {
    return fill(t.doneBody, { when: formatWhen(data.start, data.timezone, lang) });
  } catch {
    return t.doneBodyNoTime;
  }
}

export function CancelButton({ token, lang, t, rebook, errors }: CancelButtonProps) {
  const [state, setState] = useState<State>({ kind: 'idle' });

  const cancel = async () => {
    setState({ kind: 'busy' });
    try {
      const res = await fetch('/api/book/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const body = (await res.json()) as Answer;
      if (res.ok && body.ok && body.data) {
        setState({ kind: 'done', message: cancelledMessage(t, lang, body.data) });
        return;
      }
      // A link that is past or unknown will not work on a retry, so the button goes away.
      if (body.error === 'past') setState({ kind: 'final', message: t.past });
      else if (body.error === 'not_found') setState({ kind: 'final', message: t.notFound });
      else setState({ kind: 'error', message: body.error === 'paused' ? errors.paused : errors.server });
    } catch {
      setState({ kind: 'error', message: errors.network });
    }
  };

  if (state.kind === 'done' || state.kind === 'final') {
    return (
      <div className="bk-done" role="status">
        {state.kind === 'done' && <h2>{t.doneTitle}</h2>}
        <p>{state.message}</p>
        <a className="btn pri" href={rebook}>
          {t.rebook}
        </a>
      </div>
    );
  }
  return (
    <>
      <p className="lead">{t.ask}</p>
      <div className="btns">
        <button type="button" className="btn pri" onClick={() => void cancel()} disabled={state.kind === 'busy'} aria-busy={state.kind === 'busy'}>
          {state.kind === 'busy' ? t.working : t.button}
        </button>
        {state.kind === 'error' && (
          <p className="bk-msg err" role="alert">
            {state.message}
          </p>
        )}
      </div>
    </>
  );
}
