'use client';

import { useEffect } from 'react';
import { animate, inView } from 'framer-motion';

/**
 * Scroll reveals for blocks marked `data-reveal`. Only blocks that start below
 * the first screen are hidden, and only once this has run, so the page is
 * complete without JavaScript and nothing above the fold ever flashes.
 * Each reveal is a spring that starts from the block's current state.
 */
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const vh = window.innerHeight;
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]')).filter(
      (el) => el.getBoundingClientRect().top > vh,
    );
    targets.forEach((el) => el.classList.add('reveal'));
    const stops = targets.map((el) =>
      inView(
        el,
        () => {
          animate(el, { opacity: 1, transform: 'translateY(0px)' }, { type: 'spring', stiffness: 170, damping: 22 });
        },
        { amount: 0.15 },
      ),
    );
    return () => stops.forEach((stop) => stop());
  }, []);
  return null;
}
