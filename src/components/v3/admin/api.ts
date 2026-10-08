/** Small client for the admin API: JSON in, `{ ok, data, error }` out, never throws. */
export async function adminCall<T>(url: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<{ ok: true; data?: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.status === 401) {
      window.location.assign('/admin/login');
      return { ok: false, error: 'Signed out' };
    }
    const json = (await res.json()) as { ok: boolean; data?: T; error?: string };
    return json.ok ? { ok: true, data: json.data } : { ok: false, error: json.error ?? `Request failed (${res.status})` };
  } catch {
    return { ok: false, error: 'The connection dropped. Try again.' };
  }
}

export function fmtInZone(iso: string, tz: string, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-GB', { ...opts, timeZone: tz }).format(new Date(iso));
}
