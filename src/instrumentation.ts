/**
 * Runs once when the server starts (Next 14: experimental.instrumentationHook
 * in next.config.mjs). It checks a setting that would otherwise fail only when
 * a guest books: a CRM_API_ORIGIN the site refuses pauses every booking and
 * cancel (review r2). It logs and never throws, since a throw here stops the
 * whole site from starting.
 */
export async function register(): Promise<void> {
  // The import sits inside the check so the edge build (the middleware) never bundles the CRM client.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { crmOriginProblem } = await import('./lib/crm/client');
      const problem = crmOriginProblem();
      if (problem) console.error(`[startup] ${problem}`);
    } catch (err) {
      console.error('[startup] the settings check did not run:', err instanceof Error ? err.message : String(err));
    }
  }
}
