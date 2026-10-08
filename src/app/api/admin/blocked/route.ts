import { NextResponse, type NextRequest } from 'next/server';
import { addBlockedDate, listBlockedDates, removeBlockedDate } from '@/lib/scheduling/repo';
import { blockedDateSchema, firstIssue } from '@/lib/scheduling/validation';
import { isYmd } from '@/lib/scheduling/time';
import { json, readJson, requireAdmin } from '@/lib/scheduling/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/admin/blocked: close a whole day for bookings. */
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  let raw: unknown;
  try {
    raw = await readJson(req, 2048);
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON' });
  }
  const parsed = blockedDateSchema.safeParse(raw);
  if (!parsed.success) return json(400, { ok: false, error: firstIssue(parsed.error) });
  try {
    if (addBlockedDate(parsed.data) === 'full') return json(400, { ok: false, error: 'Too many blocked dates. Remove old ones first.' });
    return json(200, { ok: true, data: listBlockedDates() });
  } catch (err) {
    console.error('[admin/blocked] add failed:', err instanceof Error ? err.message : String(err));
    return json(500, { ok: false, error: 'Could not save' });
  }
}

/** DELETE /api/admin/blocked?date=YYYY-MM-DD: open the day again. */
export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const date = req.nextUrl.searchParams.get('date') ?? '';
  if (!isYmd(date)) return json(400, { ok: false, error: 'Use YYYY-MM-DD' });
  try {
    removeBlockedDate(date);
    return json(200, { ok: true, data: listBlockedDates() });
  } catch (err) {
    console.error('[admin/blocked] remove failed:', err instanceof Error ? err.message : String(err));
    return json(500, { ok: false, error: 'Could not save' });
  }
}
