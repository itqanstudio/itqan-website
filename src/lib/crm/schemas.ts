import { z } from 'zod';
import { CANCEL_REASON_MAX } from '@/lib/scheduling/limits';
import { isValidTimeZone } from '@/lib/scheduling/time';
import { BIDI_CONTROLS } from '@/lib/scheduling/validation';
import type { BookingForEmail, CancelBookingData, CreateBookingData, GuestNoticeSentData, NotifyRequest, SlotsData } from './contract';
import { HOST_SLUG } from './slug';

/*
 * Runtime checks for everything the CRM sends the website. The CRM is ours, but
 * its answers still cross a network and end up in emails and calendar files, so
 * they are validated like any other outside input.
 */

const utcIso = z.string().datetime({ offset: false });
const slug = z.string().regex(HOST_SLUG);
const timezone = z.string().max(64).refine(isValidTimeZone, 'Unknown time zone');
/** No line breaks or header separators: these values end up in mail headers and .ics lines. */
const noBreaks = (s: string) => !/[\r\n]/.test(s);
const text = (min: number, max: number) => z.string().min(min).max(max);
const email = z
  .string()
  .max(200)
  .email()
  .refine((v) => !/[\r\n,;<>"]/.test(v), 'Invalid email');

/** Only https links go into an email or an invite. */
const meetingUrl = z
  .string()
  .max(500)
  .url()
  .refine((v) => v.startsWith('https://') && noBreaks(v), 'Meeting links must be https')
  .nullable();

type Team = BookingForEmail['team'];
type Host = BookingForEmail['host'];

const teamMemberSchema = z.object({
  name: text(1, 80).refine(noBreaks),
  email,
  isHost: z.boolean(),
});

/**
 * The founders who get the calendar invite and its cancel, the booking's host
 * always among them (W1): a missing or empty list, rows that all fail the
 * checks, or a list without the host still invite the person taking the call.
 * A founder whose row does not pass the checks is left out (and logged) rather
 * than failing the booking it rides on; an address is listed once, whatever its
 * case, and the host's address alone is marked isHost.
 */
function founders(entries: readonly unknown[] | undefined, host: Host): Team {
  const hostKey = host.email.toLowerCase();
  const seen = new Set<string>();
  const listed: Team = (entries ?? []).flatMap((entry) => {
    const parsed = teamMemberSchema.safeParse(entry);
    if (!parsed.success) {
      console.error('[crm] a founder on the booking did not pass the checks and gets no calendar email');
      return [];
    }
    const key = parsed.data.email.toLowerCase();
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ name: parsed.data.name, email: parsed.data.email, isHost: key === hostKey }];
  });
  return seen.has(hostKey) ? listed : [{ name: host.name, email: host.email, isHost: true }, ...listed];
}

/** The most raw text a stored reason may carry before it is cleaned (up to 4 bytes a character). */
const STORED_REASON_RAW_MAX = CANCEL_REASON_MAX * 4;
const CONTROL_KEEP_NEWLINES = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]+/g;

/**
 * The guest's reason as the CRM stored it, as plain text (line breaks kept,
 * other control characters and bidi overrides removed, trimmed). Undefined when
 * the CRM sent no field (an older CRM), null when it holds none. One the site
 * cannot use is dropped (logged) instead of failing a cancel that happened.
 */
function storedReason(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return value;
  if (typeof value !== 'string' || value.length > STORED_REASON_RAW_MAX) {
    console.error('[crm] the stored cancel reason is not usable text; the founders get the cancel without it');
    return null;
  }
  const clean = value.replace(/\r\n?/g, '\n').replace(CONTROL_KEEP_NEWLINES, '').replace(BIDI_CONTROLS, '').trim();
  if (clean.length > CANCEL_REASON_MAX) {
    console.error('[crm] the stored cancel reason is too long; the founders get the cancel without it');
    return null;
  }
  return clean === '' ? null : clean;
}

/** Typed against the contract's output; the input is anything the CRM sent (see founders()). */
export const bookingForEmailSchema: z.ZodType<BookingForEmail, z.ZodTypeDef, unknown> = z
  .object({
    // Used in the invite UID, so a plain id only.
    id: z.string().regex(/^[A-Za-z0-9-]{1,100}$/),
    start: utcIso,
    end: utcIso,
    guestName: text(1, 200).refine(noBreaks),
    guestEmail: email,
    company: text(1, 200).refine(noBreaks),
    role: text(0, 200).refine(noBreaks),
    industry: text(0, 40).refine(noBreaks),
    message: text(0, 4000),
    topic: text(0, 40).refine(noBreaks),
    locale: z.enum(['en', 'ar']),
    guestTimezone: timezone,
    host: z.object({
      slug,
      name: text(1, 80).refine(noBreaks),
      email,
      meetingUrl,
    }),
    team: z.array(z.unknown()).max(20).optional(),
  })
  .refine((b) => Date.parse(b.end) > Date.parse(b.start), 'A booking must end after it starts')
  .transform((b) => ({ ...b, team: founders(b.team, b.host) }));

export const slotsDataSchema: z.ZodType<SlotsData> = z.object({
  slotMinutes: z.number().int().min(5).max(240),
  timezone,
  hosts: z.array(z.object({ slug, name: text(1, 80) })).max(50),
  slots: z.array(z.object({ start: utcIso, hosts: z.array(slug).max(50) })).max(20_000),
});

export const createBookingDataSchema: z.ZodType<CreateBookingData, z.ZodTypeDef, unknown> = z.object({
  booking: bookingForEmailSchema,
  cancelToken: z.string().regex(/^[A-Za-z0-9_-]{20,100}$/),
});

export const cancelBookingDataSchema: z.ZodType<CancelBookingData, z.ZodTypeDef, unknown> = z.object({
  changed: z.boolean(),
  booking: bookingForEmailSchema.optional(),
  noticeOwed: z.boolean(),
  cancelReason: z.unknown().transform(storedReason),
});

export const guestNoticeSentDataSchema: z.ZodType<GuestNoticeSentData> = z.object({
  recorded: z.boolean(),
});

export const notifyRequestSchema: z.ZodType<NotifyRequest, z.ZodTypeDef, unknown> = z.object({
  type: z.literal('booking.cancelled'),
  by: z.literal('host'),
  notifyGuest: z.boolean(),
  booking: bookingForEmailSchema,
});
