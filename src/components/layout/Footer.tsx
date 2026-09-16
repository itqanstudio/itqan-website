'use client';

import Image from 'next/image';
import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';
import { InstagramLogo, LinkedinLogo } from '@phosphor-icons/react';

const navLinks = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  // The brand portal (guidelines + asset packs) — proof of craft, deliberately
  // in the footer rather than the conversion-focused header nav.
  { href: '/brand', label: 'Brand' },
  { href: '/contact', label: 'Contact' },
  // Existing clients with a problem. Deliberately separate from Contact:
  // Contact sells, and someone whose site is down should not have to read
  // about a Brand Audit to reach us.
  { href: '/support', label: 'Support' },
];

const socials = [
  {
    href: 'https://www.instagram.com/madebyitqan/',
    label: 'Instagram',
    Icon: InstagramLogo,
  },
  {
    href: 'https://www.linkedin.com/company/110338926/',
    label: 'LinkedIn',
    Icon: LinkedinLogo,
  },
];

export function Footer() {
  const pathname = usePathname();

  /*
   * The brand-portal bail-out used to live HERE, as
   * `pathname.startsWith('/brand/')`. It is gone on purpose.
   *
   * It could not work on the live portal. brand.itqanstudio.com is REWRITTEN to
   * /brand/*, and a rewrite leaves the browser URL alone — so usePathname()
   * returned "/positioning" and the guard silently evaluated false. The footer
   * rendered on every portal page (confirmed 2026-08-13 by
   * `<nav aria-label="Footer navigation">` in the live HTML).
   *
   * The decision now happens once on the server, in the root layout, from a
   * middleware header. See lib/portal-chrome.ts. Do not add a pathname guard
   * back here: it would be a second mechanism that disagrees with the first,
   * and the wrong one would win on the subdomain.
   *
   * `pathname` is still used below for the active-link state.
   */

  return (
    <footer className="py-20 border-t border-black/[0.06] dark:border-brand-cream/[0.08]">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8">

        {/* 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 lg:gap-16">

          {/* Column 1 — Brand */}
          <div>
            <Image
              src="/images/brand/dark-icon.svg"
              alt="Itqan Studio"
              width={40}
              height={40}
              className="dark:hidden"
            />
            <Image
              src="/images/brand/light-icon.svg"
              alt="Itqan Studio"
              width={40}
              height={40}
              className="hidden dark:block"
            />
            <p
              className="mt-4 font-serif italic text-brand-accent-on-light dark:text-brand-accent leading-[1.4]"
              style={{ fontSize: '0.875rem' }}
            >
              Itqan Studio FZ-LLC, Dubai.
            </p>
            <p className="mt-3 font-sans font-normal text-[0.875rem] text-text-secondary dark:text-[rgba(255,251,245,0.55)] leading-[1.6] max-w-[32ch]">
              Systems for businesses in the UAE and Sweden.
            </p>
          </div>

          {/* Column 2 — Navigation */}
          <div>
            <p
              className="font-sans font-semibold text-[0.75rem] uppercase text-text-secondary dark:text-[rgba(255,251,245,0.45)] mb-6"
              style={{ letterSpacing: '0.15em' }}
            >
              Explore
            </p>
            <nav aria-label="Footer navigation">
              <ul className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-sans font-normal text-base text-text-primary/80 hover:text-text-primary dark:text-[rgba(255,251,245,0.75)] dark:hover:text-brand-cream transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 3 — Contact + Social */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p
              className="font-sans font-semibold text-[0.75rem] uppercase text-text-secondary dark:text-[rgba(255,251,245,0.45)] mb-6"
              style={{ letterSpacing: '0.15em' }}
            >
              Contact
            </p>
            <a
              href="mailto:info@itqanstudio.com"
              className="font-sans font-normal text-base text-text-primary/80 hover:text-text-primary dark:text-[rgba(255,251,245,0.75)] dark:hover:text-brand-cream transition-colors duration-200"
            >
              info@itqanstudio.com
            </a>
            <p className="mt-3 font-sans font-normal text-[0.875rem] text-text-secondary dark:text-[rgba(255,251,245,0.55)]">
              Dubai, UAE
            </p>

            {/* Social icons */}
            <div className="mt-8 flex items-center gap-4">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-text-secondary dark:text-[rgba(255,251,245,0.55)] hover:text-brand-accent-on-light dark:hover:text-brand-accent transition-colors duration-200"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-black/[0.06] dark:border-[rgba(255,251,245,0.08)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="font-sans font-normal text-[0.75rem] text-text-secondary dark:text-[rgba(255,251,245,0.4)]">
              &copy; 2026 Itqan Studio FZ LLC. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-[0.75rem] text-text-secondary dark:text-[rgba(255,251,245,0.4)]">
              <Link
                href="/privacy"
                className="font-sans font-normal hover:text-text-primary dark:hover:text-brand-cream transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <span aria-hidden="true">&middot;</span>
              <Link
                href="/terms"
                className="font-sans font-normal hover:text-text-primary dark:hover:text-brand-cream transition-colors duration-200"
              >
                Terms
              </Link>
              <span aria-hidden="true">&middot;</span>
              <Link
                href="/cookies"
                className="font-sans font-normal hover:text-text-primary dark:hover:text-brand-cream transition-colors duration-200"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
