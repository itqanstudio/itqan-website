import { NextResponse, type NextRequest } from 'next/server';
import { cancelBooking } from '@/lib/scheduling/repo';
import { adminCancelSchema, firstIssue } from '@/lib/scheduling/validation';
import { sendCancellation } from '@/lib/scheduling/mail';
import { json, readJson, requireAdmin } from '@/lib/scheduling/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/admin/bookings/cancel: cancel a booking and, by default, tell the guest. */
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  let raw: unknown;
  try {
    raw = await readJson(req, 1024);
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON' });
  }
  const parsed = adminCancelSchema.safeParse(raw);
  if (!parsed.success) return json(400, { ok: false, error: firstIssue(parsed.error) });
  try {
    const result = cancelBooking('admin', { id: parsed.data.id });
    if (!result.ok) return json(404, { ok: false, error: 'Booking not found' });
    let emailed = false;
    if (result.changed && parsed.data.notify) {
      const sends = await sendCancellation(result.booking, 'admin');
      emailed = sends[0]?.sent ?? false;
    }
    return json(200, { ok: true, data: { changed: result.changed, emailed } });
  } catch (err) {
    console.error('[admin/bookings/cancel] failed:', err instanceof Error ? err.message : String(err));
    return json(500, { ok: false, error: 'Could not cancel' });
  }
}
