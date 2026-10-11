'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';

type FormValues = {
  name: string;
  company: string;
  role: string;
  email: string;
  built: string;
  changed: string;
  quote: string;
  improve: string;
  publishOk: boolean;
  website: string; // honeypot
};

interface FeedbackFormProps {
  /** Project slug from ?p=, travels with the submission so Ibrahim knows which engagement. */
  project?: string;
}

const RATINGS = [1, 2, 3, 4, 5] as const;

/** A five-point pixel star on a 7 by 7 grid, drawn like the v3 icons. */
function PixelStar() {
  return (
    <svg viewBox="0 0 7 7" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M3 0h1v2H3zM0 2h7v1H0zM1 3h5v1H1zM2 4h3v1H2zM1 5h2v1H1zM4 5h2v1H4zM1 6h1v1H1zM5 6h1v1H5z" />
    </svg>
  );
}

export function FeedbackForm({ project }: FeedbackFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [ratingError, setRatingError] = useState(false);
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  // The form unmounts on success; move focus to the thank-you so it is announced.
  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  const pick = (n: number) => {
    setRating(n);
    setRatingError(false);
  };

  /* Radio-group keys: arrows move and select, Home and End jump. One tab stop for the group. */
  const onStarKey = (e: KeyboardEvent<HTMLButtonElement>, n: number) => {
    const moves: Record<string, number> = { ArrowRight: n + 1, ArrowUp: n + 1, ArrowLeft: n - 1, ArrowDown: n - 1, Home: 1, End: RATINGS.length };
    const target = moves[e.key];
    if (target === undefined) return;
    e.preventDefault();
    const next = Math.min(RATINGS.length, Math.max(1, target));
    pick(next);
    starRefs.current[next - 1]?.focus();
  };

  const onValid = async (values: FormValues) => {
    if (rating === 0) {
      setRatingError(true);
      return;
    }
    setSubmitError(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, rating, project }),
      });
      const data = await res.json();
      if (res.ok && data.ok) setDone(true);
      else setSubmitError(data.error || 'Something went wrong. Please try again.');
    } catch {
      setSubmitError('Network error. Please try again.');
    }
  };

  if (done) {
    return (
      <div className="fm-done" role="status" aria-live="polite">
        <h2 ref={doneRef} tabIndex={-1}>
          Thank you. Truly.
        </h2>
        <p>
          Your words mean a lot to a small studio. If we publish them, we will show you exactly how
          they appear first.
        </p>
      </div>
    );
  }

  const shown = hovered || rating;

  return (
    <form onSubmit={handleSubmit(onValid)} className="fm" noValidate>
      {/* Rating first: one tap, sets the tone. */}
      <div className="fm-field">
        <span className="fm-legend" id="fb-rating-label">
          How was working with us?
        </span>
        <div
          className="rate"
          role="radiogroup"
          aria-labelledby="fb-rating-label"
          aria-required="true"
          aria-invalid={ratingError ? true : undefined}
          aria-describedby={ratingError ? 'fb-rating-err' : undefined}
        >
          {RATINGS.map((n) => (
            <button
              key={n}
              ref={(el) => {
                starRefs.current[n - 1] = el;
              }}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} of 5 stars`}
              tabIndex={rating === n || (rating === 0 && n === 1) ? 0 : -1}
              className={shown >= n ? 'on' : undefined}
              onClick={() => pick(n)}
              onKeyDown={(e) => onStarKey(e, n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
            >
              <PixelStar />
            </button>
          ))}
        </div>
        {ratingError && (
          <p className="fm-err" id="fb-rating-err">
            Please pick a rating.
          </p>
        )}
      </div>

      <div className="fm-row">
        <div className="fm-field">
          <label htmlFor="fb-name">
            Your name <em>(required)</em>
          </label>
          <input
            id="fb-name"
            autoComplete="name"
            aria-required="true"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'fb-name-err' : undefined}
            {...register('name', { required: 'Please add your name' })}
          />
          {errors.name && (
            <p className="fm-err" id="fb-name-err">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="fm-field">
          <label htmlFor="fb-company">Company and role</label>
          <input id="fb-company" placeholder="e.g. Head of operations, company name" {...register('company')} />
        </div>
      </div>

      <div className="fm-field">
        <label htmlFor="fb-quote">
          What would you tell someone thinking about working with Itqan? <em>(required)</em>
        </label>
        <textarea
          id="fb-quote"
          rows={4}
          placeholder="Write it the way you would say it. A few honest sentences beat a polished paragraph."
          aria-required="true"
          aria-invalid={errors.quote ? true : undefined}
          aria-describedby={errors.quote ? 'fb-quote-err' : undefined}
          {...register('quote', { required: 'This is the one we really need' })}
        />
        {errors.quote && (
          <p className="fm-err" id="fb-quote-err">
            {errors.quote.message}
          </p>
        )}
      </div>

      <div className="fm-field">
        <label htmlFor="fb-changed">What changed for you since we shipped?</label>
        <textarea
          id="fb-changed"
          rows={3}
          placeholder="Before and after: time saved, calls that stopped, things that just work now."
          {...register('changed')}
        />
      </div>

      <div className="fm-field">
        <label htmlFor="fb-improve">Anything we should do better?</label>
        <textarea
          id="fb-improve"
          rows={2}
          placeholder="Straight talk is welcome. Only the team reads this one."
          {...register('improve')}
        />
      </div>

      <div className="fm-field">
        <label htmlFor="fb-email">
          Your email <em>(optional)</em>
        </label>
        <input
          id="fb-email"
          type="email"
          autoComplete="email"
          placeholder="Only so we can say thank you"
          {...register('email')}
        />
      </div>

      <label className="fm-check">
        <input type="checkbox" {...register('publishOk')} />
        <span>
          Itqan Studio may publish my words with my name and company on their website and portfolio.
          (Leave unticked and your feedback stays private to the team.)
        </span>
      </label>

      {/* Honeypot: humans never see it. */}
      <div aria-hidden="true" className="fm-hp">
        <label htmlFor="fb-website">Leave empty</label>
        <input id="fb-website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      {submitError && (
        <p className="fm-msg" role="alert">
          {submitError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn pri fm-submit">
        {isSubmitting ? 'Sending…' : 'Send my feedback'}
      </button>

      <p className="fm-foot">Takes about two minutes. Thank you for making the studio better.</p>
    </form>
  );
}
