import { describe, expect, it } from 'vitest';
import { bookingCopy } from '@/content/v3/booking';
import { fill } from '@/content/v3/booking-format';
import { cancelRequestSchema } from '@/lib/scheduling/validation';
import { cancelFailure, cancelRequestBody, keepHref, reasonTooLong } from './cancel-form';

const TOKEN = 'A'.repeat(43);

describe('the cancel form', () => {
  it('sends the reason only when the guest wrote one, trimmed', () => {
    expect(cancelRequestBody(TOKEN, '')).toEqual({ token: TOKEN });
    expect(cancelRequestBody(TOKEN, ' \n  ')).toEqual({ token: TOKEN });
    expect(cancelRequestBody(TOKEN, '  Plans changed.\n')).toEqual({ token: TOKEN, reason: 'Plans changed.' });
  });

  it('builds a body the cancel route accepts, up to 500 characters in either language', () => {
    expect(cancelRequestSchema.safeParse(cancelRequestBody(TOKEN, 'ب'.repeat(500))).success).toBe(true);
    expect(cancelRequestSchema.safeParse(cancelRequestBody(TOKEN, '')).success).toBe(true);
    expect(reasonTooLong('x'.repeat(500))).toBe(false);
    expect(reasonTooLong(`  ${'x'.repeat(500)}  `)).toBe(false);
    expect(reasonTooLong('x'.repeat(501))).toBe(true);
  });

  it('keeps the booking by going back to the site in the reader language', () => {
    expect(keepHref('en')).toBe('/');
    expect(keepHref('ar')).toBe('/ar');
  });

  it('reads a failed answer: only a dead link or a past call is final, every reason problem can be fixed and sent again (W7)', () => {
    expect(cancelFailure('past')).toEqual({ final: true, message: 'past' });
    expect(cancelFailure('not_found')).toEqual({ final: true, message: 'notFound' });
    expect(cancelFailure('reason_rejected')).toEqual({ final: false, message: 'reasonRejected' });
    expect(cancelFailure('reason_too_long')).toEqual({ final: false, message: 'reasonTooLong' });
    expect(cancelFailure('unreadable')).toEqual({ final: false, message: 'unreadable' });
    expect(cancelFailure('paused')).toEqual({ final: false, message: 'paused' });
    expect(cancelFailure('invalid')).toEqual({ final: false, message: 'server' });
    expect(cancelFailure('rate')).toEqual({ final: false, message: 'server' });
    expect(cancelFailure(undefined)).toEqual({ final: false, message: 'server' });
  });
});

describe('the cancel page copy', () => {
  it('asks for an optional reason and offers a quiet way to keep the booking, in both languages', () => {
    expect(bookingCopy.en.cancel.reasonLabel).toBe('Reason (optional)');
    expect(bookingCopy.en.cancel.keep).toBe('Keep my booking');
    expect(bookingCopy.en.cancel.button).toBe('Cancel the briefing');
    expect(fill(bookingCopy.en.cancel.reasonCount, { n: 12 })).toBe('12 of 500 characters');
    expect(bookingCopy.ar.cancel.reasonLabel).toBe('سبب الإلغاء (اختياري)');
    expect(bookingCopy.ar.cancel.keep).toBe('احتفظ بحجزي');
    expect(fill(bookingCopy.ar.cancel.reasonCount, { n: 12 })).toBe('12 من 500 حرف');
  });

  it('says a refused reason and an unreadable request in their own words, both asking to try again', () => {
    for (const lang of ['en', 'ar'] as const) {
      const t = bookingCopy[lang].cancel;
      expect(new Set([t.reasonTooLong, t.reasonRejected, t.unreadable, t.notFound]).size).toBe(4);
      // House style: no em or en dashes (built from code points, so none sits in this file).
      const dashes = new RegExp(`[${String.fromCodePoint(0x2013, 0x2014)}]`);
      [t.reasonRejected, t.unreadable].forEach((s) => expect(s).not.toMatch(dashes));
    }
    expect(bookingCopy.en.cancel.reasonRejected).toBe('We could not take this reason. Change it or leave it empty, then try again.');
    expect(bookingCopy.en.cancel.unreadable).toBe('Your request did not reach us in one piece. Try again.');
  });
});
