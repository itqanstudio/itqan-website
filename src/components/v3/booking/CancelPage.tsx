import { bookingCopy, formatWhen } from '@/content/v3/booking';
import type { Lang } from '@/content/v3/types';
import { findBookingByCancelToken } from '@/lib/scheduling/repo';
import { cancelRequestSchema } from '@/lib/scheduling/validation';
import { CancelButton } from './CancelButton';
import '@/styles/v3/book.css';

/** The page behind the cancel link in the confirmation email. */
export function CancelPage({ lang, token }: { lang: Lang; token: string }) {
  const t = bookingCopy[lang].cancel;
  const valid = cancelRequestSchema.safeParse({ token }).success;
  const booking = valid ? findBookingByCancelToken(token) : null;
  const rebook = lang === 'en' ? '/book' : '/ar/book';

  let body: JSX.Element;
  if (!booking) {
    body = <p className="lead">{t.notFound}</p>;
  } else if (booking.status === 'cancelled') {
    body = <p className="lead">{t.already}</p>;
  } else if (Date.parse(booking.startUtc) <= Date.now()) {
    body = <p className="lead">{t.past}</p>;
  } else {
    body = (
      <>
        <p className="lead">
          {t.body} <b>{formatWhen(booking.startUtc, booking.timezone, lang)}</b>.
        </p>
        <CancelButton token={token} t={t} rebook={rebook} fallbackError={bookingCopy[lang].errors.server} />
      </>
    );
  }

  return (
    <section className="bk bk-cancel" aria-labelledby="cancel-title">
      <div className="wrap">
        <h1 id="cancel-title">{t.title}</h1>
        {body}
        {(!booking || booking.status === 'cancelled') && (
          <a className="btn" href={rebook}>
            {t.rebook}
          </a>
        )}
      </div>
    </section>
  );
}
