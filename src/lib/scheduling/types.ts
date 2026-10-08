export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** A window of bookable time on one weekday, as wall-clock "HH:mm" in the studio time zone. */
export interface TimeRange {
  start: string;
  end: string;
}

export interface Availability {
  /** IANA zone the weekly hours are written in, e.g. "Asia/Dubai". */
  timezone: string;
  slotMinutes: number;
  /** Free minutes kept before and after every booked call. */
  bufferMinutes: number;
  /** A slot must start at least this many hours from now. */
  minNoticeHours: number;
  /** How many days ahead people can book, counted in studio dates. */
  horizonDays: number;
  maxPerDay: number;
  weekly: Record<Weekday, TimeRange[]>;
}

export type Industry = 'manufacturing' | 'retail' | 'fnb' | 'other';
export type Topic = 'briefing' | 'security';
export type Locale = 'en' | 'ar';
export type BookingStatus = 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  startUtc: string;
  endUtc: string;
  name: string;
  email: string;
  company: string;
  role: string;
  industry: Industry;
  message: string;
  topic: Topic;
  locale: Locale;
  timezone: string;
  status: BookingStatus;
  createdAt: string;
  cancelledAt: string | null;
  cancelledBy: 'guest' | 'admin' | null;
}

export interface BlockedDate {
  date: string;
  note: string;
}

/** An interval already taken, in UTC milliseconds. */
export interface Busy {
  start: number;
  end: number;
}
