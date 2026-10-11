import { z } from 'zod';
import { HOST_SLUG } from '@/lib/crm/slug';
import { CANCEL_REASON_MAX } from './limits';
import { isValidTimeZone } from './time';

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

/** What the booking widget posts to /api/book. Same limits as the CRM. */
export const bookingRequestSchema = z.object({
  start: z.string().datetime({ offset: false }),
  /** Restricts the booking to one host, from `/book?with=<slug>`. */
  with: z.string().regex(HOST_SLUG).optional(),
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

/** Bidi embedding, override and isolate marks: they make text read otherwise than it is stored. */
const BIDI_CONTROLS = /[‪-‮⁦-⁩]/g;

/**
 * The guest's reason on the cancel page, as plain text: line breaks kept (CRLF
 * and CR become LF), other control characters and bidi overrides removed,
 * trimmed, at most CANCEL_REASON_MAX characters. Empty means they gave none.
 */
const cancelReason = z
  .string()
  .max(CANCEL_REASON_MAX * 4)
  .transform((s) => s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]+/g, '').replace(BIDI_CONTROLS, '').trim())
  .pipe(z.string().max(CANCEL_REASON_MAX))
  .transform((s) => (s === '' ? undefined : s));

/** What the cancel page posts to /api/book/cancel: the link's token and an optional reason. */
export const cancelRequestSchema = z
  .object({
    token: z.string().min(20).max(100).regex(/^[A-Za-z0-9_-]+$/),
    reason: cancelReason.optional(),
  })
  .strict();

/** The first readable message from a failed parse, for a 400 response. */
export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue ? `${issue.path.join('.') || 'input'}: ${issue.message}` : 'Invalid input';
}
