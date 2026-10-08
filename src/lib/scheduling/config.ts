import type { Availability } from './types';

export const SLOT_MINUTE_OPTIONS = [15, 20, 30, 45, 60] as const;
export const LIMITS = {
  bufferMinutes: { min: 0, max: 120 },
  minNoticeHours: { min: 0, max: 336 },
  horizonDays: { min: 1, max: 120 },
  maxPerDay: { min: 1, max: 24 },
  rangesPerDay: 6,
  blockedDates: 400,
} as const;

/** Time zones offered in the admin. The studio works from Dubai and Gothenburg. */
export const TIMEZONE_OPTIONS = ['Asia/Dubai', 'Europe/Stockholm', 'Europe/London', 'UTC'] as const;

/**
 * Starting hours before anyone edits them: weekday mornings and afternoons in
 * Dubai, inside the Service Levels support window (Mon to Fri, 09:00 to 18:00 GST).
 */
export const DEFAULT_AVAILABILITY: Availability = {
  timezone: 'Asia/Dubai',
  slotMinutes: 30,
  bufferMinutes: 15,
  minNoticeHours: 24,
  horizonDays: 21,
  maxPerDay: 4,
  weekly: {
    mon: [{ start: '10:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
    tue: [{ start: '10:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
    wed: [{ start: '10:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
    thu: [{ start: '10:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
    fri: [{ start: '10:00', end: '12:00' }],
    sat: [],
    sun: [],
  },
};

/** Bookings are deleted this long after the booked time (privacy policy). */
export const RETENTION_DAYS = 365;
/** Upcoming briefings one email address, or one connection, may hold at a time. */
export const MAX_ACTIVE_PER_EMAIL = 1;
export const MAX_ACTIVE_PER_IP = 2;
export const LOGIN_TOKEN_MINUTES = 15;
export const SESSION_DAYS = 14;
/**
 * `__Host-` pins the cookie to this exact host, HTTPS and path "/", so no sibling
 * subdomain can set or overwrite it. Browsers refuse it over plain http, so
 * local development uses the bare name.
 */
export const SESSION_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-itqan_admin' : 'itqan_admin';
