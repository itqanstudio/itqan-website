/**
 * Website <-> CRM booking integration contract (server to server, HMAC signed).
 *
 * Types only. The website keeps a verbatim copy at `src/lib/crm/contract.ts`.
 * Source of truth: `docs/v3/REBUILD-SPEC.md` section 8.
 */

export const SIGNATURE_HEADER = "x-itqan-signature";
export const SIGNATURE_MAX_SKEW_SECONDS = 300;
export const MIN_SECRET_LENGTH = 32;
/**
 * The message on a 503 "server" answer to POST bookings when the booking
 * certainly did not happen (the database refused it, or nothing could be read).
 * Any other 5xx may follow a committed booking, so the website says "unconfirmed".
 */
export const NOT_BOOKED = "not_booked";

export type IntegrationErrorCode =
  | "unauthorized"
  | "invalid"
  | "unavailable"
  | "limit"
  | "not_found"
  | "past"
  | "server";

export type IntegrationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: IntegrationErrorCode; message?: string };

export interface SlotsData {
  slotMinutes: number;
  /** The studio's display time zone, e.g. "Asia/Dubai". */
  timezone: string;
  hosts: Array<{ slug: string; name: string }>;
  /** Ascending UTC ISO start times with the hosts free at each. */
  slots: Array<{ start: string; hosts: string[] }>;
}

export interface CreateBookingRequest {
  /** UTC ISO, must be one of the offered slots. */
  start: string;
  /** Restrict to one host slug ("ibrahim", "bisma"). */
  with?: string;
  name: string;
  email: string;
  company: string;
  role: string;
  industry: "manufacturing" | "retail" | "fnb" | "other";
  message: string;
  topic: "briefing" | "security";
  locale: "en" | "ar";
  /** The visitor's IANA time zone. */
  timezone: string;
  /** HMAC-SHA256 of the visitor IP keyed by ITQAN_BOOKING_SECRET (64 hex); never the raw IP. */
  ipHash: string;
}

export interface BookingForEmail {
  id: string;
  start: string;
  end: string;
  guestName: string;
  guestEmail: string;
  company: string;
  role: string;
  industry: string;
  message: string;
  topic: string;
  locale: "en" | "ar";
  guestTimezone: string;
  host: { slug: string; name: string; email: string; meetingUrl: string | null };
  /**
   * Every active founder (their booking_hosts row, taking bookings or not), the
   * host marked isHost. The website sends each one the calendar invite (REQUEST)
   * and, on any cancel, its CANCEL. The host is always on it: both sides add
   * them when the list is empty or leaves them out, listed once by address.
   */
  team: Array<{ name: string; email: string; isHost: boolean }>;
}

export interface CreateBookingData {
  booking: BookingForEmail;
  /** Plaintext once; the CRM stores only its sha256. The website emails it to the guest. */
  cancelToken: string;
}

export interface CancelBookingRequest {
  token: string;
  /** The guest's reason: plain text, trimmed, 1 to 500 characters. Left out when they gave none. */
  reason?: string;
}

export interface CancelBookingData {
  changed: boolean;
  booking?: BookingForEmail;
  /**
   * True while a guest cancel's emails (guest and host) are not confirmed sent.
   * The website sends them, then calls POST bookings/notice-sent. A retry after a
   * lost answer therefore still sends them, and a confirmed send is never repeated.
   */
  noticeOwed: boolean;
  /**
   * The guest's reason as the CRM stored it (the cancel that went through keeps
   * it, a repeat never changes it), or null when they gave none. The founders'
   * CANCEL carries this, never a retry's own text. A CRM from before this field
   * leaves it out.
   */
  cancelReason?: string | null;
}

/** Website -> CRM after a guest cancel's emails went out: POST bookings/notice-sent */
export interface GuestNoticeSentRequest {
  token: string;
}

export interface GuestNoticeSentData {
  /** False when an earlier call already recorded it. */
  recorded: boolean;
}

export interface LegacyBooking {
  id: string;
  start_utc: string;
  end_utc: string;
  name: string;
  email: string;
  company: string;
  role: string;
  industry: string;
  message: string;
  topic: string;
  locale: string;
  timezone: string;
  status: "confirmed" | "cancelled";
  created_at: string;
  cancelled_at: string | null;
  cancelled_by: string | null;
}

export interface LegacyAvailability {
  timezone: string;
  slotMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  horizonDays: number;
  maxPerDay: number;
  weekly: Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", Array<{ start: string; end: string }>>;
}

export interface ImportRequest {
  bookings: LegacyBooking[];
  availability?: LegacyAvailability;
  blockedDates?: Array<{ date: string; note: string }>;
}

export interface ImportData {
  imported: number;
  skipped: number;
}

/** CRM -> website: POST /api/crm/notify */
export interface NotifyRequest {
  type: "booking.cancelled";
  by: "host";
  notifyGuest: boolean;
  booking: BookingForEmail;
}

export interface NotifyData {
  emailed: boolean;
}
