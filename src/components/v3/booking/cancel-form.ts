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
