'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PORTAL_NAV, PORTAL_PAGES } from '@/data/brand-portal';
import { currentPortalPath } from './path';

export function SideNav() {
  const path = currentPortalPath(usePathname());
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Closing returns focus to the toggle, so keyboard users are not dropped onto a hidden link.
  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    const main = document.getElementById('main');
    if (!open) {
      main?.removeAttribute('inert');
      return;
    }
    // The page under the overlay is out of reach while the menu is open.
    main?.setAttribute('inert', '');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      main?.removeAttribute('inert');
    };
  }, [open, close]);

  const link = (href: string, label: string) => (
    // Tapping the page you are on does not change the path, so close here too.
    <Link href={href} aria-current={href === path ? 'page' : undefined} onClick={() => setOpen(false)}>
      {label}
    </Link>
  );

  return (
    <>
      <button ref={buttonRef} type="button" className="pt-menu" aria-expanded={open} aria-controls="pt-side" onClick={() => setOpen((v) => !v)}>
        {open ? 'Close' : 'Menu'}
      </button>
      <nav id="pt-side" className="pt-side" data-open={open} aria-label="Brand portal">
        {PORTAL_NAV.map((cat) => (
          <div key={cat.label}>
            <h2>{cat.label}</h2>
            <ul>
              {cat.items.map((p) => (
                <li key={p.href}>
                  {link(p.href, p.label)}
                  {p.children && (
                    <ul>
                      {p.children.map((c) => (
                        <li key={c.href}>{link(c.href, c.label)}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}

/** Previous and next page, in sidebar order, so the manual reads front to back. */
export function PrevNext() {
  const path = currentPortalPath(usePathname());
  const i = PORTAL_PAGES.findIndex((p) => p.href === path);
  if (i < 0) return null;
  const prev = PORTAL_PAGES[i - 1];
  const next = PORTAL_PAGES[i + 1];
  return (
    <nav className="pt-pn" aria-label="Previous and next page">
      {prev && (
        <Link href={prev.href}>
          <span>Previous</span>
          <b>{prev.label}</b>
        </Link>
      )}
      {next && (
        <Link href={next.href} className="next">
          <span>Next</span>
          <b>{next.label}</b>
        </Link>
      )}
    </nav>
  );
}
