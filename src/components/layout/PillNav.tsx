'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'next-view-transitions';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  useReducedMotion,
  useDragControls,
  type AnimationPlaybackControls,
  type ValueAnimationTransition,
} from 'framer-motion';
import { Clock, List, X } from '@phosphor-icons/react';
import { RollButton } from '@/components/ui/RollButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { projectMomentum, SPRING_SHEET, SPRING_MOMENTUM } from '@/lib/motion';
import { pauseSmoothScroll, resumeSmoothScroll } from '@/lib/smooth-scroll';
import { INTRO_CALL_URL, INTRO_CALL_LABEL } from '@/lib/booking';

const NAV_LINKS = [
  { href: '/work', label: 'Work' },
  // URL kept for search; the label is what changed (decided 8 Sep 2026).
  { href: '/services', label: 'How we work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/** Fallback sheet travel before the real height is measured. */
const SHEET_FALLBACK_TRAVEL = 460;
/** Gap below the sheet's resting position, so "closed" clears the screen edge. */
const SHEET_CLEARANCE = 32;
/** Past this fraction of the sheet's height, a projected flick dismisses it. */
const DISMISS_THRESHOLD = 0.4;

/** Live Dubai time, HH:MM. Placeholder until mounted to avoid hydration mismatch. */
function useDubaiTime(): string {
  const [time, setTime] = useState('--:--');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Dubai',
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/**
 * Global Axion-style pill navigation — sticky, theme-aware, on every page.
 * Carries the availability note, live Dubai clock, theme toggle, primary CTA,
 * and the mobile bottom-sheet menu (full modal contract).
 *
 * The bar is a translucent MATERIAL, not an opaque strip: page content scrolls
 * underneath it and dissolves into a scroll-edge blur rather than being sliced
 * by a hard edge. The material thickens once the page has scrolled, so at rest
 * the nav sits quietly on the hero.
 *
 * The mobile sheet is direct-manipulation: it tracks the finger 1:1, resists
 * past its open position, projects the flick's momentum to choose dismiss vs.
 * settle, and hands the release velocity to the spring so there is no seam
 * between dragging and animating.
 */
export function PillNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [quarter, setQuarter] = useState('');
  const dubaiTime = useDubaiTime();
  const pathname = usePathname();
  const sheetRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();

  // Sheet position in px. 0 = fully open; `travel` = fully off the bottom.
  const sheetY = useMotionValue(SHEET_FALLBACK_TRAVEL);
  const [travel, setTravel] = useState(SHEET_FALLBACK_TRAVEL);
  // `travel` is re-measured after first paint, so the scrim maps through a REF in
  // a closure transform rather than a baked [0, travel] range — an array range
  // captured at mount can keep mapping over the stale fallback.
  const travelRef = useRef(SHEET_FALLBACK_TRAVEL);
  /** One owner for the sheet's motion value — see `runSheet`. */
  const sheetAnim = useRef<AnimationPlaybackControls | null>(null);
  /** Invalidates an in-flight dismissal if the user grabs the sheet again. */
  const dismissToken = useRef(0);
  // The scrim is driven BY the sheet's position, so dimming tracks the finger.
  const scrimOpacity = useTransform(sheetY, (v) =>
    Math.min(1, Math.max(0, 1 - v / travelRef.current)),
  );

  // Availability quarter, derived from the real date so it never goes stale.
  useEffect(() => {
    const d = new Date();
    setQuarter(`Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`);
  }, []);

  // Material weight responds to scroll. Lenis drives window scroll, so the
  // native event fires normally.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /*
   * Scroll lock. `body { overflow: hidden }` alone does NOT hold: Lenis drives
   * scrolling from its own wheel/touch listeners, so the page kept scrolling
   * behind the open sheet on a trackpad. Lenis has to be told to stop too.
   */
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = 'hidden';
    pauseSmoothScroll();
    // Cleanup is the single owner of the teardown, so closing cannot resume
    // twice in a row.
    return () => {
      document.body.style.overflow = '';
      resumeSmoothScroll();
    };
  }, [menuOpen]);

  /**
   * Single writer for `sheetY`. Every open, settle and dismiss goes through here
   * so two animations can never fight over the same motion value — grabbing the
   * sheet mid-open used to leave the opening spring and the drag both writing to
   * it, which showed up as a jump or a wrong dismissal.
   */
  const runSheet = useCallback(
    (to: number, transition: ValueAnimationTransition<number>) => {
      sheetAnim.current?.stop();
      sheetAnim.current = animate(sheetY, to, transition);
      return sheetAnim.current;
    },
    [sheetY],
  );

  // Measure the real sheet height on open, then spring it up from off-screen.
  useEffect(() => {
    if (!menuOpen) return;
    // `||` not `??`: a first paint that reports offsetHeight 0 would otherwise
    // make travel 32px and open the sheet already almost fully on screen.
    const measured = (sheetRef.current?.offsetHeight || SHEET_FALLBACK_TRAVEL) + SHEET_CLEARANCE;
    setTravel(measured);
    travelRef.current = measured;
    sheetY.set(measured);
    runSheet(0, {
      ...SPRING_SHEET,
      ...(reduceMotion ? { bounce: 0, duration: 0.01 } : null),
    });
    return () => sheetAnim.current?.stop();
  }, [menuOpen, sheetY, reduceMotion, runSheet]);

  /** Animate the sheet out, then unmount. Carries the gesture's velocity. */
  const dismiss = useCallback(
    (velocity = 0) => {
      const token = ++dismissToken.current;
      runSheet(travelRef.current, {
        type: 'spring',
        bounce: 0,
        duration: reduceMotion ? 0.01 : 0.3,
        velocity,
      }).then(() => {
        // A stopped animation still settles its promise. Without this guard,
        // re-grabbing the sheet mid-dismissal would unmount it under the finger.
        if (token === dismissToken.current) setMenuOpen(false);
      });
    },
    [runSheet, reduceMotion],
  );
  /*
   * The focus trap must subscribe to `menuOpen` ALONE. Listing `dismiss` in its
   * deps re-ran the effect the moment `travel` was measured on open, and the
   * teardown's `menuTriggerRef.focus()` yanked focus out of the open dialog and
   * back to the Menu button before the re-run put it back — the trap contract
   * broke on every open for keyboard and screen-reader users. Reading `dismiss`
   * through a ref keeps the handler current without re-subscribing.
   */
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;

  // Close the sheet on route change (no exit animation — the page is leaving).
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Mobile sheet modal contract: initial focus, Escape close, Tab trap, focus restore.
  useEffect(() => {
    if (!menuOpen) return;
    const sheet = sheetRef.current;
    const focusables = () =>
      sheet ? Array.from(sheet.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')) : [];
    focusables()[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        dismissRef.current();
        return;
      }
      if (e.key === 'Tab') {
        const els = focusables();
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      menuTriggerRef.current?.focus();
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50">
      {/* Scroll edge: content dissolves into the chrome instead of meeting a hard
          line. Only painted once there is content underneath to dissolve. */}
      <div
        aria-hidden="true"
        className={`scroll-edge pointer-events-none absolute inset-x-0 top-0 h-[92px] -z-10 transition-opacity duration-300 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="max-w-[1440px] w-full mx-auto p-2 sm:p-3">
        <nav
          className={`material-chrome flex items-center justify-between rounded-full bg-white/70 dark:bg-[#2a1a28]/65 border-t border-white/70 dark:border-brand-cream/10 p-[5px] transition-shadow duration-300 ${
            scrolled
              ? 'shadow-[0_10px_34px_-14px_rgba(47,28,44,0.28)]'
              : 'shadow-[0_2px_12px_rgba(47,28,44,0.05)]'
          }`}
          aria-label="Main navigation"
        >
          {/* Logo + links */}
          <div className="flex items-center gap-6 pl-1">
            <Link
              href="/"
              aria-label="Itqan Studio — home"
              className="press-scale flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-dark dark:bg-brand-cream flex-shrink-0"
            >
              <Image src="/images/brand/light-icon.svg" alt="" width={18} height={18} className="dark:hidden" />
              <Image src="/images/brand/dark-icon.svg" alt="" width={18} height={18} className="hidden dark:block" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((l) => {
                const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    className={`text-[0.875rem] font-medium transition-colors duration-300 ${
                      active
                        ? 'text-brand-accent-on-light dark:text-brand-accent'
                        : 'text-text-primary hover:text-text-secondary dark:text-brand-cream dark:hover:text-brand-cream/70'
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right cluster */}
          <div className="hidden md:flex items-center gap-4">
            {quarter && (
              <span className="hidden lg:block text-[0.8125rem] text-text-secondary dark:text-brand-cream/55">
                Taking on projects for {quarter}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[0.8125rem] text-text-secondary dark:text-brand-cream/55 tabular-nums">
              <Clock size={14} aria-hidden="true" />
              {dubaiTime} in Dubai
            </span>
            <ThemeToggle />
            <RollButton
              href={INTRO_CALL_URL}
              label={INTRO_CALL_LABEL}
              external
              umamiEvent="cta_nav"
            />
          </div>

          {/* Mobile: theme + menu */}
          <div className="flex md:hidden items-center gap-2 pr-1">
            <ThemeToggle />
            <button
              ref={menuTriggerRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              className="press-scale inline-flex items-center gap-1.5 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark px-4 py-2 text-[0.8125rem] font-semibold"
            >
              <List size={15} weight="bold" />
              Menu
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Scrim dims in lockstep with the sheet's position, so dragging the
              sheet down brightens the page continuously rather than at the end. */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            style={{ opacity: scrimOpacity }}
            onClick={() => dismiss()}
          />

          <motion.div
            ref={sheetRef}
            style={{ y: sheetY }}
            /* Drag stays enabled under reduced motion — direct manipulation is
               user-driven, not vestibular. Only the settle gets shortened.
               `dragListener={false}` + explicit controls so the gesture starts
               only from the grabber/header strip: with a listener on the whole
               sheet, dragging inside the now-scrollable link list moved the sheet
               instead of scrolling the list. */
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            /* Below the open position the sheet is unconstrained, so it tracks
               the finger 1:1. Above it the constraint engages and rubber-bands. */
            dragConstraints={{ top: 0 }}
            dragElastic={0.5}
            /* Framer's own inertia is off — we project the momentum ourselves so
               the landing decision and the animation share one velocity. */
            dragMomentum={false}
            onDragStart={() => {
              // Take ownership: cancel any in-flight open/settle/dismiss so the
              // drag is the only writer, and invalidate a pending dismissal.
              sheetAnim.current?.stop();
              dismissToken.current += 1;
            }}
            onDragEnd={(_, info) => {
              const velocity = info.velocity.y;
              const projected = sheetY.get() + projectMomentum(velocity);
              if (projected > travelRef.current * DISMISS_THRESHOLD) {
                dismiss(velocity);
              } else {
                // Bounce is earned here: the gesture carried momentum.
                runSheet(0, {
                  ...SPRING_MOMENTUM,
                  ...(reduceMotion ? { bounce: 0, duration: 0.01 } : null),
                  velocity,
                });
              }
            }}
            /* Capped and internally scrollable. Unbounded, the sheet grew past a
               short viewport (landscape phone, or a tall system font) and pushed
               its own Close button above the top of the screen while body scroll
               was locked — the menu became a trap with no way out. */
            className="material-chrome relative flex max-h-[85svh] flex-col bg-white/85 dark:bg-[#2a1a28]/85 border-t border-white/80 dark:border-brand-cream/10 rounded-2xl mx-3 mb-3 px-6 pb-6 pt-3 shadow-[0_-10px_40px_-16px_rgba(47,28,44,0.45)]"
          >
            {/* Grabber — the affordance that says "this is draggable", and the
                handle the drag gesture actually starts from. Padded well past
                the 5px bar so it is a comfortable touch target. */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              style={{ touchAction: 'none' }}
              className="mx-auto -mt-1 mb-3 flex h-8 w-full flex-shrink-0 cursor-grab items-center justify-center active:cursor-grabbing"
            >
              <span
                aria-hidden="true"
                className="h-[5px] w-[38px] rounded-full bg-black/15 dark:bg-brand-cream/25"
              />
            </div>

            <div className="flex flex-shrink-0 items-center justify-between mb-8">
              <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-text-secondary dark:text-brand-cream/55 tabular-nums border border-black/10 dark:border-brand-cream/15 rounded-full px-3 py-1.5">
                <Clock size={13} aria-hidden="true" />
                {dubaiTime} in Dubai
              </span>
              <button
                type="button"
                onClick={() => dismiss()}
                aria-label="Close navigation menu"
                className="press-scale inline-flex items-center gap-1.5 rounded-full bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark px-4 py-2 text-[0.8125rem] font-semibold"
              >
                <X size={15} weight="bold" />
                Close
              </button>
            </div>

            {/* The links scroll inside the sheet when they cannot all fit, so the
                sheet itself never outgrows the viewport. `overscroll-contain`
                stops a flick here from chaining to the locked page behind. */}
            <nav
              className="flex min-h-0 flex-1 flex-col gap-5 mb-8 overflow-y-auto overscroll-contain"
              style={{ touchAction: 'pan-y' }}
              aria-label="Mobile navigation"
            >
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-[1.75rem] leading-[2rem] font-medium text-text-primary dark:text-brand-cream"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Closing on tap matters most on /contact, where the CTA links to the
                page you are already on: without this the sheet just sat there. */}
            <div className="flex-shrink-0">
              <RollButton
                href={INTRO_CALL_URL}
                label={INTRO_CALL_LABEL}
                external
                className="w-full justify-between"
                umamiEvent="cta_nav_mobile"
                onClick={() => setMenuOpen(false)}
              />
            </div>
          </motion.div>
        </div>
      )}
    </header>
  );
}
