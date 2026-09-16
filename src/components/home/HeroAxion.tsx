'use client';

import { useEffect, useState } from 'react';
import { Link } from 'next-view-transitions';
import dynamic from 'next/dynamic';
import { RollButton } from '@/components/ui/RollButton';
import { PartnerStrip } from '@/components/home/PartnerStrip';
import { INTRO_CALL_URL, INTRO_CALL_LABEL } from '@/lib/booking';

// WebGPU shader is client-only; the section's CSS gradient is the fallback.
const HeroShader = dynamic(() => import('@/components/home/HeroShader'), { ssr: false });

/** Starburst mark for the proof badge (from the Axion reference, brand-recolored). */
function Starburst({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="m19.6 66.5 19.7-11 .3-1-.3-.5h-1l-3.3-.2-11.2-.3L14 53l-9.5-.5-2.4-.5L0 49l.2-1.5 2-1.3 2.9.2 6.3.5 9.5.6 6.9.4L38 49.1h1.6l.2-.7-.5-.4-.4-.4L29 41l-10.6-7-5.6-4.1-3-2-1.5-2-.6-4.2 2.7-3 3.7.3.9.2 3.7 2.9 8 6.1L37 36l1.5 1.2.6-.4.1-.3-.7-1.1L33 25l-6-10.4-2.7-4.3-.7-2.6c-.3-1-.4-2-.4-3l3-4.2L28 0l4.2.6L33.8 2l2.6 6 4.1 9.3L47 29.9l2 3.8 1 3.4.3 1h.7v-.5l.5-7.2 1-8.7 1-11.2.3-3.2 1.6-3.8 3-2L61 2.6l2 2.9-.3 1.8-1.1 7.7L59 27.1l-1.5 8.2h.9l1-1.1 4.1-5.4 6.9-8.6 3-3.5L77 13l2.3-1.8h4.3l3.1 4.7-1.4 4.9-4.4 5.6-3.7 4.7-5.3 7.1-3.2 5.7.3.4h.7l12-2.6 6.4-1.1 7.6-1.3 3.5 1.6.4 1.6-1.4 3.4-8.2 2-9.6 2-14.3 3.3-.2.1.2.3 6.4.6 2.8.2h6.8l12.6 1 3.3 2 1.9 2.7-.3 2-5.1 2.6-6.8-1.6-16-3.8-5.4-1.3h-.8v.4l4.6 4.5 8.3 7.5L89 80.1l.5 2.4-1.3 2-1.4-.2-9.2-7-3.6-3-8-6.8h-.5v.7l1.8 2.7 9.8 14.7.5 4.5-.7 1.4-2.6 1-2.7-.6-5.8-8-6-9-4.7-8.2-.5.4-2.9 30.2-1.3 1.5-3 1.2-2.5-2-1.4-3 1.4-6.2 1.6-8 1.3-6.4 1.2-7.9.7-2.6v-.2H49L43 72l-9 12.3-7.2 7.6-1.7.7-3-1.5.3-2.8L24 86l10-12.8 6-7.9 4-4.6-.1-.5h-.3L17.2 77.4l-4.7.6-2-2 .2-3 1-1 8-5.5Z"
      />
    </svg>
  );
}

/**
 * Axion-style hero. The global PillNav (layout) sits sticky above this section,
 * so the hero fills the remaining viewport rather than 100dvh.
 */
export function HeroAxion() {
  const [showShader, setShowShader] = useState(false);

  // Defer the WebGPU shader chunk until after LCP, and never fetch it for
  // reduced-motion users (the CSS gradient fallback covers both cases).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = () => setShowShader(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative min-h-[calc(100dvh-76px)] flex flex-col overflow-hidden bg-brand-cream dark:bg-[#1f1420]"
      aria-label="Introduction"
    >
      {/* CSS gradient fallback — always painted; the shader layers on top when available */}
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 75% 60% at 78% 22%, rgba(204,164,194,0.28), transparent 60%), radial-gradient(ellipse 60% 55% at 12% 80%, rgba(209,194,165,0.22), transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 75% 60% at 78% 22%, rgba(204,164,194,0.14), transparent 60%), radial-gradient(ellipse 60% 55% at 12% 80%, rgba(209,194,165,0.08), transparent 60%)',
        }}
      />

      {/* Animated shader overlay — mounted post-idle, skipped for reduced motion */}
      {showShader && <HeroShader />}

      {/* Spacer — the hero content is bottom-anchored, the art sits above it */}
      <div className="relative z-20 flex-1" aria-hidden="true" />

      {/* ── Hero content — bottom-anchored ── */}
      <div className="relative z-20 max-w-[1440px] w-full mx-auto px-5 sm:px-8 lg:px-12 pb-12 sm:pb-16 lg:pb-20">
        <p className="text-[0.8125rem] sm:text-[0.875rem] font-medium tracking-wide text-text-primary dark:text-brand-cream mb-5 sm:mb-7">
          Itqan Studio. Dubai and Sweden.
        </p>

        <h1
          className="display-type font-sans font-semibold text-text-primary dark:text-brand-cream"
          style={{ fontSize: 'clamp(2.25rem, 6.5vw, 4.2rem)' }}
        >
          We build the system your business{' '}
          <span
            className="text-brand-accent-on-light dark:text-brand-accent"
            style={{ fontFamily: "var(--font-serif), serif", fontStyle: 'italic', fontWeight: 500 }}
          >
            runs on
          </span>
          . Then we stay to run it.
        </h1>

        <p className="mt-5 sm:mt-6 text-[0.9375rem] sm:text-[1.0625rem] leading-[1.55] text-[#4a4a4a] dark:text-brand-cream/70 max-w-[52ch]">
          Bookings, intake, customer records, invoicing and follow-up, with the website
          in front. Live in weeks. Owned by you.
        </p>

        {/* CTA row */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <RollButton
            href={INTRO_CALL_URL}
            label={INTRO_CALL_LABEL}
            external
            className="self-start"
            umamiEvent="cta_hero"
          />

          <Link
            href="/work"
            className="press-scale self-start inline-flex items-center gap-2 text-[0.875rem] sm:text-[0.9375rem] font-semibold text-text-primary dark:text-brand-cream underline underline-offset-[6px] decoration-brand-accent-on-light/50 dark:decoration-brand-accent/50 hover:decoration-brand-accent-on-light dark:hover:decoration-brand-accent"
          >
            See the work
          </Link>
        </div>

        {/* Proof line — every claim here is a shipped fact, not a slogan */}
        <p className="mt-6 sm:mt-7 flex items-start gap-2.5 text-[0.8125rem] sm:text-[0.875rem] leading-[1.5] text-text-primary/80 dark:text-brand-cream/60 max-w-[56ch]">
          <Starburst className="mt-[0.15em] w-4 h-4 flex-shrink-0 text-brand-accent-on-light dark:text-brand-accent" />
          <span>
            Lemon Garden: seven restaurants, one booking system, live in a week.
            PMP certified. Dubai and Sweden.
          </span>
        </p>

        {/* Partner credibility — registered AWS + Shopify partner programs */}
        <PartnerStrip />
      </div>
    </section>
  );
}
