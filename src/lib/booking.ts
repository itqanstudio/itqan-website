/**
 * Booking destinations for the legacy pages (feedback, support, magnet, brand
 * portal). Since 8 Oct 2026 the briefing is booked on the site itself at /book,
 * which is a different root layout, so links here must stay plain anchors
 * (RollButton `external`), not the view-transitions router.
 */

/** The 30-minute executive briefing: free, booked on itqanstudio.com/book. */
export const INTRO_CALL_URL = '/book';

/** The Session (90 min): your written operations map, paid at booking on Calendly. */
export const SESSION_URL =
  'https://calendly.com/ibrahim-shareefi/90-minute-brand-strategy-session';

/** The label used for the primary call-to-action on the legacy pages. */
export const INTRO_CALL_LABEL = 'Book a briefing';
