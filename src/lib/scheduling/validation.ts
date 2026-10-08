import { z } from 'zod';
import { LIMITS, SLOT_MINUTE_OPTIONS } from './config';
import { WEEKDAYS, type Availability } from './types';
import { isHHMM, isValidTimeZone, isYmd, minutesOf } from './time';

/** Single-line text: trimmed, control characters and line breaks removed. */
const line = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim())
    .pipe(z.string().max(max));

const multiline = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]+/g, '').trim())
    .pipe(z.string().max(max));

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(200)
  .email()
  .refine((v) => !/[\r\n,;<>]/.test(v), 'Invalid email');

const timezone = z.string().max(64).refine(isValidTimeZone, 'Unknown time zone');

export const bookingRequestSchema = z.object({
  start: z.string().datetime({ offset: false }),
  name: line(120).pipe(z.string().min(2)),
  email,
  company: line(160).pipe(z.string().min(1)),
  role: line(120).optional().default(''),
  industry: z.enum(['manufacturing', 'retail', 'fnb', 'other']),
  message: multiline(2000).optional().default(''),
  topic: z.enum(['briefing', 'security']).optional().default('briefing'),
  locale: z.enum(['en', 'ar']),
  timezone,
  /** Honeypot: hidden from people, so any value means a script filled the form. */
  leave_empty: z.string().max(200).optional().default(''),
});
export type BookingRequest = z.infer<typeof bookingRequestSchema>;

export const cancelRequestSchema = z.object({
  token: z.string().min(20).max(100).regex(/^[A-Za-z0-9_-]+$/),
});

export const loginRequestSchema = z.object({ email });
export const sessionRequestSchema = cancelRequestSchema;

const range = z
  .object({ start: z.string().refine(isHHMM), end: z.string().refine(isHHMM) })
  .refine((r) => minutesOf(r.end) > minutesOf(r.start), 'A range must end after it starts');

const dayRanges = z
  .array(range)
  .max(LIMITS.rangesPerDay)
  .refine((rs) => {
    const sorted = [...rs].sort((a, b) => minutesOf(a.start) - minutesOf(b.start));
    return sorted.every((r, i) => i === 0 || minutesOf(r.start) >= minutesOf(sorted[i - 1].end));
  }, 'Ranges on one day must not overlap');

const int = (min: number, max: number) => z.number().int().min(min).max(max);

export const availabilitySchema: z.ZodType<Availability> = z.object({
  timezone,
  slotMinutes: z
    .number()
    .int()
    .refine((n) => (SLOT_MINUTE_OPTIONS as readonly number[]).includes(n), 'Unsupported slot length'),
  bufferMinutes: int(LIMITS.bufferMinutes.min, LIMITS.bufferMinutes.max),
  minNoticeHours: int(LIMITS.minNoticeHours.min, LIMITS.minNoticeHours.max),
  horizonDays: int(LIMITS.horizonDays.min, LIMITS.horizonDays.max),
  maxPerDay: int(LIMITS.maxPerDay.min, LIMITS.maxPerDay.max),
  weekly: z.object(
    Object.fromEntries(WEEKDAYS.map((d) => [d, dayRanges])) as Record<(typeof WEEKDAYS)[number], typeof dayRanges>,
  ),
});

export const blockedDateSchema = z.object({
  date: z.string().refine(isYmd, 'Use YYYY-MM-DD'),
  note: line(200).optional().default(''),
});

export const adminCancelSchema = z.object({
  id: z.string().uuid(),
  notify: z.boolean().optional().default(true),
});

/** The first readable message from a failed parse, for a 400 response. */
export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue ? `${issue.path.join('.') || 'input'}: ${issue.message}` : 'Invalid input';
}
