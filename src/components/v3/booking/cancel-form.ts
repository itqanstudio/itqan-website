import { CANCEL_REASON_MAX } from '@/lib/scheduling/limits';

/*
 * The cancel page's form, as pure functions (the component stays thin).
 * The server trims and cleans the reason again; these keep the page honest
 * about what it will send.
 */

export interface CancelRequestBody {
  token: string;
  reason?: string;
}

/** The body the page posts: the token, and the reason only when the guest wrote one. */
export function cancelRequestBody(token: string, reason: string): CancelRequestBody {
  const trimmed = reason.trim();
  return trimmed ? { token, reason: trimmed } : { token };
}

/** True when the reason, as it will be sent, is over the limit (the box's maxLength normally stops this). */
export function reasonTooLong(reason: string): boolean {
  return reason.trim().length > CANCEL_REASON_MAX;
}

/** Where "Keep my booking" goes: the site's home page in the reader's language. */
export function keepHref(lang: 'en' | 'ar'): string {
  return lang === 'ar' ? '/ar' : '/';
}

/** Which sentence a failed cancel shows: cancel-page copy, or the shared paused, rate and server errors. */
export type CancelFailureMessage = 'past' | 'notFound' | 'reasonTooLong' | 'reasonRejected' | 'unreadable' | 'paused' | 'rate' | 'server';

export interface CancelFailure {
  /** True when the link cannot work again: the form is replaced by the message and a rebook link. */
  final: boolean;
  message: CancelFailureMessage;
}

/**
 * What an error code from POST /api/book/cancel means for the page. Only a
 * call that already took place or a link that failed is final; a reason the
 * CRM refused, one that is too long, a request that arrived broken or
 * malformed (`invalid`), or too many tries (`rate`, wait and send again) keep
 * the form so the guest can send again.
 */
export function cancelFailure(code: string | undefined): CancelFailure {
  switch (code) {
    case 'past':
      return { final: true, message: 'past' };
    case 'not_found':
      return { final: true, message: 'notFound' };
    case 'reason_rejected':
      return { final: false, message: 'reasonRejected' };
    case 'reason_too_long':
      return { final: false, message: 'reasonTooLong' };
    case 'unreadable':
    case 'invalid':
      return { final: false, message: 'unreadable' };
    case 'rate':
      return { final: false, message: 'rate' };
    case 'paused':
      return { final: false, message: 'paused' };
    default:
      return { final: false, message: 'server' };
  }
}
