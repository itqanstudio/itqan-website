'use client';

import { useId, useState } from 'react';
import type { BookingCopy } from '@/content/v3/booking';
import { fill, formatWhen } from '@/content/v3/booking-format';
import type { Lang } from '@/content/v3/types';
import { CANCEL_REASON_MAX } from '@/lib/scheduling/limits';
import { cancelFailure, cancelRequestBody, keepHref, reasonTooLong, type CancelFailureMessage } from './cancel-form';

interface CancelButtonProps {
  token: string;
  lang: Lang;
  t: BookingCopy['cancel'];
  rebook: string;
  errors: { server: string; paused: string; rate: string; network: string };
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

/** What a failed answer means for the page (cancelFailure): a link that cannot work again is final; anything else may be retried. */
function failureState(body: Answer, t: BookingCopy['cancel'], errors: CancelButtonProps['errors']): State {
  const failure = cancelFailure(body.error);
  const text: Record<CancelFailureMessage, string> = {
    past: t.past,
    notFound: t.notFound,
    reasonTooLong: t.reasonTooLong,
    reasonRejected: t.reasonRejected,
    unreadable: t.unreadable,
    paused: errors.paused,
    rate: errors.rate,
    server: errors.server,
  };
  return { kind: failure.final ? 'final' : 'error', message: text[failure.message] };
}

/**
 * The confirm step behind the cancel link: an optional reason (500 characters,
 * with a count), "Cancel the briefing" as the one primary action, and a quiet
 * link that keeps the booking. Opening the page changes nothing.
 */
export function CancelButton({ token, lang, t, rebook, errors }: CancelButtonProps) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [reason, setReason] = useState('');
  const ids = useId();
  const reasonId = `${ids}-reason`;
  const tooLong = reasonTooLong(reason);

  const cancel = async () => {
    if (tooLong) {
      setState({ kind: 'error', message: t.reasonTooLong });
      return;
    }
    setState({ kind: 'busy' });
    try {
      const res = await fetch('/api/book/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelRequestBody(token, reason)),
      });
      const body = (await res.json()) as Answer;
      if (res.ok && body.ok && body.data) {
        setState({ kind: 'done', message: cancelledMessage(t, lang, body.data) });
        return;
      }
      setState(failureState(body, t, errors));
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
  const busy = state.kind === 'busy';
  return (
    <form
      className="bk-form bk-cancel-form"
      onSubmit={(event) => {
        event.preventDefault();
        void cancel();
      }}
    >
      <p className="lead">{t.ask}</p>
      <label htmlFor={reasonId}>
        <span>{t.reasonLabel}</span>
        <textarea
          id={reasonId}
          rows={3}
          maxLength={CANCEL_REASON_MAX}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-describedby={`${reasonId}-hint ${reasonId}-count`}
          aria-invalid={tooLong || undefined}
          disabled={busy}
        />
        <span className="bk-reason-foot">
          <small className="bk-hint" id={`${reasonId}-hint`}>
            {t.reasonHint}
          </small>
          <small className={tooLong ? 'bk-err' : 'bk-hint'} id={`${reasonId}-count`}>
            {fill(t.reasonCount, { n: reason.length })}
          </small>
        </span>
      </label>
      {state.kind === 'error' && (
        <p className="bk-msg err" role="alert">
          {state.message}
        </p>
      )}
      <div className="bk-cancel-actions">
        <button type="submit" className="btn pri" disabled={busy} aria-busy={busy}>
          {busy ? t.working : t.button}
        </button>
        <a className="bk-keep" href={keepHref(lang)}>
          {t.keep}
        </a>
      </div>
    </form>
  );
}
