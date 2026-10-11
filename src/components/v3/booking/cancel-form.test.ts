import { describe, expect, it } from 'vitest';
import { bookingCopy } from '@/content/v3/booking';
import { fill } from '@/content/v3/booking-format';
import { cancelRequestSchema } from '@/lib/scheduling/validation';
import { cancelRequestBody, keepHref, reasonTooLong } from './cancel-form';

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
});
