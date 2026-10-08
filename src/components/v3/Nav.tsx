'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from 'framer-motion';
import type { SiteDict } from '@/content/v3/types';
import { counterpartPath } from '@/lib/v3/seo';
import { Lockup } from './brand';

interface NavProps {
  t: SiteDict['nav'];
  lang: SiteDict['lang'];
}

const SPRING = { type: 'spring', stiffness: 420, damping: 40 } as const;

export function Nav({ t, lang }: NavProps) {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  // The sheet is dragged from its header and handle only, so its list still scrolls by touch.
  const dragControls = useDragControls();
  const startDrag = (e: ReactPointerEvent) => {
    if (!reduce) dragControls.start(e);
  };
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const home = lang === 'en' ? '/' : '/ar';
  const bookHref = lang === 'en' ? '/book' : '/ar/book';
  const other = counterpartPath(pathname, lang);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    sheetRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key !== 'Tab' || !sheetRef.current) return;
      const items = sheetRef.current.querySelectorAll<HTMLElement>('a, button');
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // Close when the route changes (a link inside the sheet was followed).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* The sheet is dragged up to dismiss: it follows the finger, and the release
     velocity decides, so a fast short flick closes it like a long slow pull. */
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -80 || info.velocity.y < -500) close();
  };

  return (
    <>
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <nav className="n" aria-label={lang === 'en' ? 'Main' : 'الرئيسية'}>
        <div className="wrap">
          <Link className="home" href={home} aria-label={t.home}>
            <Lockup gid={`nav-sym-${lang}`} lang={lang} />
          </Link>
          <div className="links">
            {t.links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
          <span className="sp" />
          <a className="lang" href={other} lang={lang === 'en' ? 'ar' : 'en'} hrefLang={lang === 'en' ? 'ar' : 'en'} aria-label={t.switchLabel}>
            {t.switchTo}
          </a>
          <Link className="btn pri nav-cta" href={bookHref}>
            {t.cta}
          </Link>
          <button
            ref={buttonRef}
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls={open ? "v3-menu" : undefined}
            onClick={() => setOpen(true)}
          >
            <span className="bars" aria-hidden="true">
              <i />
              <i />
            </span>
            {t.menu}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="back"
              className="sheet-back"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.2 }}
              onClick={close}
            />
            <motion.div
              key="sheet"
              id="v3-menu"
              ref={sheetRef}
              className="sheet"
              role="dialog"
              aria-modal="true"
              aria-label={t.menu}
              initial={reduce ? false : { y: '-100%' }}
              animate={{ y: 0 }}
              exit={reduce ? { opacity: 0 } : { y: '-100%' }}
              transition={reduce ? { duration: 0 } : SPRING}
              drag={reduce ? false : 'y'}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.9, bottom: 0.08 }}
              dragMomentum={false}
              dragControls={dragControls}
              dragListener={false}
              style={{ touchAction: 'pan-y' }}
              onDragEnd={onDragEnd}
            >
              <div className="top" onPointerDown={startDrag}>
                <Link className="home" href={home} aria-label={t.home} onClick={close}>
                  <Lockup gid={`sheet-sym-${lang}`} lang={lang} />
                </Link>
                <button type="button" className="menu-btn" onClick={close} aria-label={t.close}>
                  ✕
                </button>
              </div>
              <ul>
                {t.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} onClick={() => setOpen(false)}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="btns">
                <Link className="btn pri" href={bookHref} onClick={() => setOpen(false)}>
                  {t.cta}
                </Link>
                <a className="btn" href={other} lang={lang === 'en' ? 'ar' : 'en'} hrefLang={lang === 'en' ? 'ar' : 'en'}>
                  {t.switchTo}
                </a>
              </div>
              <span className="grab" aria-hidden="true" onPointerDown={startDrag} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
