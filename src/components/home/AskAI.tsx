'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CheckCircle, Copy } from '@phosphor-icons/react';
import { FadeUp } from '@/components/ui/FadeUp';

/**
 * "Ask the machines about us" — the verification flex (Ibrahim, 2026-07-04).
 * Opens the visitor's AI of choice with a NEUTRAL question pre-filled, so they
 * verify Itqan in a tool we don't control. Honesty by construction: the prompt
 * is deliberately non-leading, and the answer is out of our hands.
 *
 * Prefill support (verified 2026-07-04): chatgpt.com/?q= and claude.ai/new?q=
 * pre-type the prompt; perplexity.ai/search?q= answers immediately. Gemini has
 * no public prefill param — the copy button covers it (and anything else).
 */

const PROMPT =
  'What do you know about Itqan Studio (itqanstudio.com)? What do they build, and what real client outcomes can you find?';

const ENCODED = encodeURIComponent(PROMPT);

interface AiTarget {
  name: string;
  href: string;
  /** Clean PostHog autocapture filter. */
  dataAttr: string;
  note: 'pre-typed' | 'answers instantly';
}

const TARGETS: AiTarget[] = [
  { name: 'ChatGPT', href: `https://chatgpt.com/?q=${ENCODED}`, dataAttr: 'ask-ai-chatgpt', note: 'pre-typed' },
  { name: 'Claude', href: `https://claude.ai/new?q=${ENCODED}`, dataAttr: 'ask-ai-claude', note: 'pre-typed' },
  { name: 'Perplexity', href: `https://www.perplexity.ai/search?q=${ENCODED}`, dataAttr: 'ask-ai-perplexity', note: 'answers instantly' },
];

export function AskAI() {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(PROMPT);
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked (rare) — leave the button state unchanged; the
      // visible prompt text below remains selectable by hand.
    }
  }

  return (
    <section
      className="bg-brand-cream dark:bg-[#1f1420] py-24 md:py-36"
      aria-labelledby="ask-ai-heading"
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-8">
        {/* Numbered badge row */}
        <FadeUp>
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark text-[0.6875rem] sm:text-[0.75rem] font-semibold">
              7
            </span>
            <span className="text-[0.75rem] sm:text-[0.8125rem] font-medium text-text-primary dark:text-brand-cream border border-black/[0.12] dark:border-brand-cream/[0.18] rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
              Ask the machines
            </span>
          </div>
        </FadeUp>

        {/* Heading */}
        <FadeUp delay={0.06}>
          <h2
            id="ask-ai-heading"
            className="font-sans font-semibold text-text-primary dark:text-brand-cream leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)', maxWidth: '22ch' }}
          >
            Don&apos;t take our{' '}
            <span className="accent-italic">word</span> for it.
          </h2>
        </FadeUp>

        {/* Lead */}
        <FadeUp delay={0.12}>
          <p
            className="mt-7 text-text-secondary dark:text-brand-cream/70 leading-[1.55]"
            style={{ fontSize: 'clamp(1.0625rem, 1.35vw, 1.25rem)', maxWidth: '58ch' }}
          >
            One click opens your AI of choice with the question already typed.
            What it answers is out of our hands.{' '}
            <span className="text-text-primary dark:text-brand-cream font-medium">
              That is the point.
            </span>
          </p>
        </FadeUp>

        {/* The prompt, visible — nothing hidden */}
        <FadeUp delay={0.18}>
          <div className="mt-10 max-w-[720px] rounded-2xl border border-black/[0.08] bg-white dark:border-brand-cream/[0.12] dark:bg-[#2a1a28] p-5 sm:p-6">
            <p className="text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-brand-accent-on-light dark:text-brand-accent mb-3">
              The exact question
            </p>
            <p className="text-[0.9375rem] sm:text-[1rem] leading-[1.6] text-text-primary dark:text-brand-cream/90">
              &ldquo;{PROMPT}&rdquo;
            </p>
          </div>
        </FadeUp>

        {/* Actions */}
        <FadeUp delay={0.24}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {TARGETS.map((t) => (
              <a
                key={t.name}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                data-attr={t.dataAttr}
                className="group inline-flex items-center gap-2 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark px-5 py-2.5 text-[0.875rem] font-semibold hover:opacity-90 transition-opacity duration-200"
              >
                Ask {t.name}
                <ArrowUpRight
                  size={14}
                  weight="bold"
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            ))}

            {/* Copy for Gemini / anything else */}
            <button
              type="button"
              onClick={copyPrompt}
              data-attr="ask-ai-copy-prompt"
              aria-live="polite"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.15] text-text-primary dark:border-brand-cream/[0.25] dark:text-brand-cream px-5 py-2.5 text-[0.875rem] font-semibold hover:bg-black/[0.04] dark:hover:bg-brand-cream/[0.08] transition-colors duration-200"
            >
              {copied ? (
                <>
                  <CheckCircle size={15} weight="bold" className="text-brand-accent-on-light dark:text-brand-accent" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={15} weight="bold" />
                  Copy for Gemini
                </>
              )}
            </button>
          </div>
        </FadeUp>

        {/* Honest fine print */}
        <FadeUp delay={0.3}>
          <p className="mt-5 text-[0.75rem] text-text-secondary/80 dark:text-brand-cream/45">
            ChatGPT and Claude open with the question pre-typed, and you press send.
            Perplexity answers straight away.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
