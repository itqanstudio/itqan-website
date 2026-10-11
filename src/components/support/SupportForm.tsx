'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';

/**
 * Support request form. This posts CROSS-ORIGIN into the CRM at
 * portal.itqanstudio.com/api/tickets/intake, which creates a tracked ticket and
 * emails the requester a private link to follow it.
 *
 * There is no local /api route on purpose: adding one would mean this
 * marketing site needed the CRM's credentials. The CRM owns the ticket; this
 * site only hands it the request. The CRM's CORS allowlist names this origin.
 */

type FormValues = {
  name: string;
  email: string;
  company: string;
  subject: string;
  requestType: string;
  deviceType: string;
  message: string;
  /**
   * Honeypot. Named hp_ref rather than something plausible like
   * "companyWebsite" precisely so browser autofill and password managers do
   * NOT fill it: an autofilled honeypot silently discards a real person's
   * request and neither side ever finds out.
   */
  hp_ref: string;
};

const CRM_ORIGIN = (
  process.env.NEXT_PUBLIC_CRM_ORIGIN || 'https://portal.itqanstudio.com'
).replace(/\/+$/, '');

type Field = keyof FormValues;
const errorId = (field: Field) => `sup-${field}-err`;

/** aria attributes that tie a required input to its error message. */
function ariaFor(field: Field, errors: FieldErrors<FormValues>) {
  const invalid = Boolean(errors[field]);
  return {
    'aria-required': true,
    'aria-invalid': invalid || undefined,
    'aria-describedby': invalid ? errorId(field) : undefined,
  } as const;
}

function FieldError({ field, errors }: { field: Field; errors: FieldErrors<FormValues> }) {
  const message = errors[field]?.message;
  if (!errors[field]) return null;
  return (
    <p className="fm-err" id={errorId(field)}>
      {message}
    </p>
  );
}

export function SupportForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  // The form unmounts on success; move focus to the confirmation so it is announced.
  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  const onValid = async (values: FormValues) => {
    setSubmitError(null);
    try {
      const res = await fetch(`${CRM_ORIGIN}/api/tickets/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        // `reference` is absent when the honeypot fired: the response is
        // deliberately indistinguishable from success, so never render it blind.
        setReference(typeof data.reference === 'string' ? data.reference : null);
        setDone(true);
      } else {
        setSubmitError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please try again, or email info@itqanstudio.com.');
    }
  };

  if (done) {
    return (
      <div className="fm-done" role="status" aria-live="polite">
        <h2 ref={doneRef} tabIndex={-1}>
          We have your request
        </h2>
        {reference && (
          <p>
            Your reference is <code>{reference}</code>.
          </p>
        )}
        <p>
          Check your email for a private link. You can read our replies and answer there, or just
          reply to the email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="fm">
      <div className="fm-field">
        <label htmlFor="sup-name">Your name</label>
        <input
          id="sup-name"
          autoComplete="name"
          placeholder="Sara Haddad"
          {...ariaFor('name', errors)}
          {...register('name', { required: 'Please tell us your name.', maxLength: 120 })}
        />
        <FieldError field="name" errors={errors} />
      </div>

      <div className="fm-row">
        <div className="fm-field">
          <label htmlFor="sup-email">Email</label>
          <input
            id="sup-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            {...ariaFor('email', errors)}
            {...register('email', {
              required: 'We need an email to reply to.',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'That email looks off.' },
            })}
          />
          <FieldError field="email" errors={errors} />
        </div>

        <div className="fm-field">
          <label htmlFor="sup-company">
            Company <em>(optional)</em>
          </label>
          <input
            id="sup-company"
            autoComplete="organization"
            placeholder="Acme"
            {...register('company', { maxLength: 160 })}
          />
        </div>
      </div>

      <div className="fm-row">
        <div className="fm-field">
          <label htmlFor="sup-request-type">Request type</label>
          <select
            id="sup-request-type"
            defaultValue=""
            {...ariaFor('requestType', errors)}
            {...register('requestType', { required: 'Pick what this is about.' })}
          >
            <option value="" disabled>
              Choose one…
            </option>
            <option value="issue">Something is broken</option>
            <option value="question">A question</option>
            <option value="billing">Billing</option>
            <option value="feature">A request or an idea</option>
            <option value="other">Something else</option>
          </select>
          <FieldError field="requestType" errors={errors} />
        </div>

        <div className="fm-field">
          <label htmlFor="sup-device-type">
            Device <em>(optional)</em>
          </label>
          <select id="sup-device-type" defaultValue="" {...register('deviceType')}>
            <option value="">Not device-specific</option>
            <option value="web">Web or browser</option>
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="fm-field">
        <label htmlFor="sup-subject">What is this about?</label>
        <input
          id="sup-subject"
          placeholder="Cannot log in to the portal"
          {...ariaFor('subject', errors)}
          {...register('subject', { required: 'A short subject helps us route it.', maxLength: 200 })}
        />
        <FieldError field="subject" errors={errors} />
      </div>

      <div className="fm-field">
        <label htmlFor="sup-message">Tell us what is happening</label>
        <textarea
          id="sup-message"
          rows={6}
          placeholder="What you expected, what happened instead, and anything you have already tried."
          {...ariaFor('message', errors)}
          {...register('message', { required: 'Please describe the problem.', maxLength: 8000 })}
        />
        <FieldError field="message" errors={errors} />
      </div>

      {/* Honeypot. Hidden from people and from assistive tech; bots fill it. */}
      <div aria-hidden="true" className="fm-hp">
        <label htmlFor="hp_ref">Leave this field empty</label>
        <input id="hp_ref" tabIndex={-1} autoComplete="off" {...register('hp_ref')} />
      </div>

      {submitError && (
        <p className="fm-msg" role="alert">
          {submitError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn pri fm-submit">
        {isSubmitting ? 'Sending…' : 'Send request'}
        {!isSubmitting && (
          <span className="arr" aria-hidden="true">
            →
          </span>
        )}
      </button>
    </form>
  );
}
