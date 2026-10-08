'use client';

import { useEffect } from 'react';

/**
 * Self-hosted Umami analytics loader.
 *
 * WHY UMAMI RUNS WITHOUT A CONSENT GATE (and PostHog does not)
 * -----------------------------------------------------------
 * PostHogProvider is deliberately blocked behind CookieBanner acceptance,
 * because PostHog sets cookies and localStorage identifiers and persists them
 * across sessions — that needs opt-in consent under GDPR/PECR.
 *
 * Umami is different by design: it sets NO cookies, writes NO localStorage, and
 * assigns no persistent cross-session identifier. Visitors are counted with a
 * salted hash that is rotated daily and never stored on the device. With no
 * data stored on or read from the visitor's terminal equipment, the PECR/
 * ePrivacy "cookie rule" (which is about storage/access, not about analytics
 * as an activity) does not apply, and there is nothing to consent to.
 *
 * The practical consequence is the entire reason for this file: analytics that
 * only load after an Accept click measure the subset of people who click
 * Accept. Cookieless analytics measure everyone. Those are very different
 * numbers, and only one of them is usable for deciding anything.
 *
 * Do Not Track is still honoured below — that is a courtesy, not a legal
 * requirement, and it is cheap.
 *
 * WHY A CLIENT FETCH INSTEAD OF A <script> IN THE LAYOUT
 * -----------------------------------------------------
 * The pages are statically generated, so a script tag written at author time
 * would need a build-time env var and would be frozen into the deploy. This
 * fetches /api/analytics-config at request time instead. See that route for the
 * full reasoning. Unconfigured → `{}` → this component injects nothing.
 */

type AnalyticsConfig = {
  scriptUrl?: string;
  websiteId?: string;
};

const SCRIPT_ID = 'umami-tracker';

export function UmamiAnalytics() {
  useEffect(() => {
    // Honour Do Not Track / Global Privacy Control before doing anything,
    // including the config fetch.
    const nav = window.navigator as Navigator & {
      msDoNotTrack?: string;
      globalPrivacyControl?: boolean;
    };
    const dnt =
      nav.doNotTrack === '1' ||
      nav.msDoNotTrack === '1' ||
      (window as unknown as { doNotTrack?: string }).doNotTrack === '1' ||
      nav.globalPrivacyControl === true;
    if (dnt) return;

    // Never on pages whose URL is a credential (booking cancel links) or private (admin):
    // the tracker stores the path, which would put the cancel token in analytics.
    if (/\/book\/cancel\/|^\/admin/.test(window.location.pathname)) return;

    // Idempotent: React 18 StrictMode double-invokes effects in development,
    // and a second <script> tag would double-count every page view.
    if (document.getElementById(SCRIPT_ID)) return;

    // AbortController so a fast unmount (route change during the fetch) does
    // not inject a tracker into a page that is already gone.
    const controller = new AbortController();

    fetch('/api/analytics-config', { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<AnalyticsConfig>) : null))
      .then((config) => {
        if (!config?.scriptUrl || !config.websiteId) return; // not configured
        if (document.getElementById(SCRIPT_ID)) return; // raced with StrictMode

        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = config.scriptUrl;
        script.defer = true;
        script.setAttribute('data-website-id', config.websiteId);
        // Umami tracks SPA route changes on its own via the History API, which
        // is what next-view-transitions navigation uses — so no manual
        // pageview call is needed here (unlike the PostHog provider, which
        // captures route changes explicitly).
        document.head.appendChild(script);
      })
      .catch(() => {
        // Network error, abort, or malformed config — analytics simply stay
        // off. This must never surface to a visitor.
      });

    return () => controller.abort();
  }, []);

  return null;
}
