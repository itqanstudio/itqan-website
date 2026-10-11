import { bookingCopy } from '@/content/v3/booking';
import type { Lang } from '@/content/v3/types';
import { cancelRequestSchema } from '@/lib/scheduling/validation';
import { CancelButton } from './CancelButton';
import '@/styles/v3/book.css';

/**
 * The page behind the cancel link in the confirmation email. The booking lives
 * in the CRM, which has no "look up by token" call, so the page asks first (with
 * an optional reason) and shows the booked time once the cancel went through.
 */
export function CancelPage({ lang, token }: { lang: Lang; token: string }) {
  const copy = bookingCopy[lang];
  const t = copy.cancel;
  const valid = cancelRequestSchema.safeParse({ token }).success;
  const rebook = lang === 'en' ? '/book' : '/ar/book';

  return (
    <section className="bk bk-cancel" aria-labelledby="cancel-title">
      <div className="wrap">
        <h1 id="cancel-title">{t.title}</h1>
        {valid ? (
          <CancelButton token={token} lang={lang} t={t} rebook={rebook} errors={{ server: copy.errors.server, paused: copy.errors.paused, network: copy.errors.network }} />
        ) : (
          <>
            <p className="lead">{t.notFound}</p>
            <a className="btn" href={rebook}>
              {t.rebook}
            </a>
          </>
        )}
      </div>
    </section>
  );
}
