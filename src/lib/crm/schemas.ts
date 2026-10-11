import { z } from 'zod';
import { isValidTimeZone } from '@/lib/scheduling/time';
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

export const bookingForEmailSchema: z.ZodType<BookingForEmail> = z
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
  })
  .refine((b) => Date.parse(b.end) > Date.parse(b.start), 'A booking must end after it starts');

export const slotsDataSchema: z.ZodType<SlotsData> = z.object({
  slotMinutes: z.number().int().min(5).max(240),
  timezone,
  hosts: z.array(z.object({ slug, name: text(1, 80) })).max(50),
  slots: z.array(z.object({ start: utcIso, hosts: z.array(slug).max(50) })).max(20_000),
});

export const createBookingDataSchema: z.ZodType<CreateBookingData> = z.object({
  booking: bookingForEmailSchema,
  cancelToken: z.string().regex(/^[A-Za-z0-9_-]{20,100}$/),
});

export const cancelBookingDataSchema: z.ZodType<CancelBookingData> = z.object({
  changed: z.boolean(),
  booking: bookingForEmailSchema.optional(),
  noticeOwed: z.boolean(),
});

export const guestNoticeSentDataSchema: z.ZodType<GuestNoticeSentData> = z.object({
  recorded: z.boolean(),
});

export const notifyRequestSchema: z.ZodType<NotifyRequest> = z.object({
  type: z.literal('booking.cancelled'),
  by: z.literal('host'),
  notifyGuest: z.boolean(),
  booking: bookingForEmailSchema,
});
