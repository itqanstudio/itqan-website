import type { BookingCopy } from '@/content/v3/booking';
import type { WidgetSlots } from '@/lib/crm/widget-slots';

/*
 * The widget's two calls to this site's own API, as plain functions with
 * typed outcomes, so the component only decides what to show.
 */

export type SlotsLoad = { state: 'ready'; slots: string[]; hosts: WidgetSlots['hosts'] } | { state: 'paused' } | { state: 'error' };

export interface Booked {
  id: string;
  start: string;
  end: string;
  hostName: string;
  emailed: boolean;
}

/** `unconfirmed`: the CRM may have booked but the site never got its answer. */
export type BookFailure = 'paused' | 'limit' | 'rate' | 'invalid' | 'server' | 'network' | 'unconfirmed';
export type BookOutcome = { kind: 'booked'; booked: Booked } | { kind: 'taken' } | { kind: 'failed'; reason: BookFailure };

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

interface Envelope {
  ok?: unknown;
  error?: unknown;
  data?: unknown;
}

async function envelope(res: Response): Promise<Envelope> {
  try {
    const body: unknown = await res.json();
    return body && typeof body === 'object' ? (body as Envelope) : {};
  } catch {
    return {};
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asSlots(data: unknown): WidgetSlots | null {
  if (!isRecord(data) || !Array.isArray(data.slots) || !data.slots.every((s) => typeof s === 'string')) return null;
  const hosts = Array.isArray(data.hosts)
    ? data.hosts.filter((h): h is { slug: string; name: string } => isRecord(h) && typeof h.slug === 'string' && typeof h.name === 'string')
    : [];
  return { slots: data.slots, slotMinutes: Number(data.slotMinutes) || 0, timezone: String(data.timezone ?? ''), hosts };
}

function asBooked(data: unknown): Booked | null {
  if (!isRecord(data)) return null;
  const { id, start, end, hostName, emailed } = data;
  if (typeof id !== 'string' || typeof start !== 'string' || typeof end !== 'string' || typeof hostName !== 'string') return null;
  return { id, start, end, hostName, emailed: emailed === true };
}

export function slotsReady(data: WidgetSlots): SlotsLoad {
  return { state: 'ready', slots: data.slots, hosts: data.hosts };
}

/** GET /api/book/slots, narrowed to one host when `withSlug` is set. */
export async function loadSlots(withSlug: string | undefined, fetcher: Fetcher = fetch): Promise<SlotsLoad> {
  try {
    const res = await fetcher(`/api/book/slots${withSlug ? `?with=${encodeURIComponent(withSlug)}` : ''}`, { cache: 'no-store' });
    const body = await envelope(res);
    const data = res.ok && body.ok === true ? asSlots(body.data) : null;
    if (data) return slotsReady(data);
    return res.status === 503 && body.error === 'paused' ? { state: 'paused' } : { state: 'error' };
  } catch {
    return { state: 'error' };
  }
}

/** POST /api/book with the form, the picked time and the context fields. */
export async function postBooking(payload: Readonly<Record<string, unknown>>, fetcher: Fetcher = fetch): Promise<BookOutcome> {
  let res: Response;
  try {
    res = await fetcher('/api/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  } catch {
    return { kind: 'failed', reason: 'network' };
  }
  const body = await envelope(res);
  const booked = res.ok && body.ok === true ? asBooked(body.data) : null;
  if (booked) return { kind: 'booked', booked };
  if (res.status === 409) return { kind: 'taken' };
  if (body.error === 'unconfirmed') return { kind: 'failed', reason: 'unconfirmed' };
  if (body.error === 'paused') return { kind: 'failed', reason: 'paused' };
  if (body.error === 'limit') return { kind: 'failed', reason: 'limit' };
  if (res.status === 429) return { kind: 'failed', reason: 'rate' };
  if (res.status === 400) return { kind: 'failed', reason: 'invalid' };
  return { kind: 'failed', reason: 'server' };
}

export function failureMessage(errors: BookingCopy['errors'], reason: BookFailure): string {
  return errors[reason];
}
