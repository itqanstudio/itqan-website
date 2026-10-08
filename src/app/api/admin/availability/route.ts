import { NextResponse, type NextRequest } from 'next/server';
import { saveAvailability } from '@/lib/scheduling/repo';
import { availabilitySchema, firstIssue } from '@/lib/scheduling/validation';
import { json, readJson, requireAdmin } from '@/lib/scheduling/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** PUT /api/admin/availability: replace the weekly hours and booking rules. */
export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  let raw: unknown;
  try {
    raw = await readJson(req);
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON' });
  }
  const parsed = availabilitySchema.safeParse(raw);
  if (!parsed.success) return json(400, { ok: false, error: firstIssue(parsed.error) });
  try {
    saveAvailability(parsed.data);
    return json(200, { ok: true, data: parsed.data });
  } catch (err) {
    console.error('[admin/availability] save failed:', err instanceof Error ? err.message : String(err));
    return json(500, { ok: false, error: 'Could not save' });
  }
}
