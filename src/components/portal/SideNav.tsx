'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PORTAL_NAV, PORTAL_PAGES } from '@/data/brand-portal';

/**
 * The portal root is reached two ways: itqanstudio.com/brand, and the root of
 * brand.itqanstudio.com, which middleware rewrites to /brand without changing
 * the browser URL. Treat both as the overview page.
 */
export function currentPortalPath(pathname: string | null): string {
  if (!pathname || pathname === '/') return '/brand';
  return pathname.replace(/\/$/, '');
}

export function SideNav() {
  const path = currentPortalPath(usePathname());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const link = (href: string, label: string) => (
    <Link href={href} aria-current={href === path ? 'page' : undefined}>
      {label}
    </Link>
  );

  return (
    <>
      <button type="button" className="pt-menu" aria-expanded={open} aria-controls="pt-side" onClick={() => setOpen((v) => !v)}>
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
