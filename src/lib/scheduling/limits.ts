/** The most a guest's cancel reason may hold: the CRM stores at most this many (bookings.cancel_reason). */
export const CANCEL_REASON_MAX = 500;

/** The longest token a cancel link carries. */
export const CANCEL_TOKEN_MAX = 100;

/**
 * The most raw text a reason may carry before it is cleaned (control characters
 * and bidi marks removed, trimmed): room for a reason that cleans down to the
 * limit. Longer is refused as too long without cleaning it.
 */
export const CANCEL_REASON_RAW_MAX = CANCEL_REASON_MAX * 4;

/**
 * The cancel request's body cap: the longest token and raw reason with every
 * UTF-16 unit written as a JSON \uXXXX escape (six bytes, its longest
 * spelling), plus room for the keys and whitespace. Any body the schema could
 * take fits, so a long reason is answered reason_too_long, never unreadable.
 */
export const CANCEL_BODY_MAX_BYTES = 6 * (CANCEL_TOKEN_MAX + CANCEL_REASON_RAW_MAX) + 1_024;
