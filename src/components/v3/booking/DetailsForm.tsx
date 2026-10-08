'use client';

import { useState, type FormEvent } from 'react';
import type { BookingCopy } from '@/content/v3/booking';

export interface Details {
  name: string;
  email: string;
  company: string;
  role: string;
  industry: '' | 'manufacturing' | 'retail' | 'fnb' | 'other';
  message: string;
  leave_empty: string;
}

export const EMPTY_DETAILS: Details = { name: '', email: '', company: '', role: '', industry: '', message: '', leave_empty: '' };

interface DetailsFormProps {
  t: BookingCopy;
  lang: 'en' | 'ar';
  value: Details;
  busy: boolean;
  error: string | null;
  onChange: (next: Details) => void;
  onSubmit: () => void;
}

type FieldErrors = Partial<Record<'name' | 'email' | 'company' | 'industry', true>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateDetails(d: Details): FieldErrors {
  const e: FieldErrors = {};
  if (d.name.trim().length < 2) e.name = true;
  if (!EMAIL.test(d.email.trim())) e.email = true;
  if (!d.company.trim()) e.company = true;
  if (!d.industry) e.industry = true;
  return e;
}

export function DetailsForm({ t, lang, value, busy, error, onChange, onSubmit }: DetailsFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const f = t.fields;
  // After a failed submit, marks clear as soon as a field becomes valid.
  const set = (k: keyof Details) => (v: string) => {
    const next = { ...value, [k]: v };
    onChange(next);
    if (Object.keys(errors).length > 0) setErrors(validateDetails(next));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateDetails(value);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`bk-${first}`)?.focus();
      return;
    }
    onSubmit();
  };

  const invalid = (k: keyof FieldErrors) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': 'bk-form-err' } : {});
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form className="bk-form" onSubmit={submit} noValidate>
      <div className="bk-step">{t.steps.details}</div>
      <label>
        <span>{f.name}</span>
        <input id="bk-name" autoComplete="name" value={value.name} maxLength={120} onChange={(e) => set('name')(e.target.value)} required {...invalid('name')} />
      </label>
      <label>
        <span>{f.email}</span>
        <input id="bk-email" type="email" inputMode="email" autoComplete="email" dir="ltr" value={value.email} maxLength={200} onChange={(e) => set('email')(e.target.value)} required {...invalid('email')} />
        <small className={errors.email ? 'bk-err' : 'bk-hint'}>{f.emailHint}</small>
      </label>
      <div className="bk-row">
        <label>
          <span>{f.company}</span>
          <input id="bk-company" autoComplete="organization" value={value.company} maxLength={160} onChange={(e) => set('company')(e.target.value)} required {...invalid('company')} />
        </label>
        <label>
          <span>
            {f.role} <em>({f.optional})</em>
          </span>
          <input id="bk-role" autoComplete="organization-title" value={value.role} maxLength={120} onChange={(e) => set('role')(e.target.value)} />
        </label>
      </div>
      <label>
        <span>{f.industry}</span>
        <select id="bk-industry" value={value.industry} onChange={(e) => set('industry')(e.target.value)} required {...invalid('industry')}>
          <option value="" disabled>
            {lang === 'en' ? 'Choose one' : 'اختر'}
          </option>
          {(Object.keys(t.industries) as (keyof BookingCopy['industries'])[]).map((k) => (
            <option key={k} value={k}>
              {t.industries[k]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>
          {f.message} <em>({f.optional})</em>
        </span>
        <textarea id="bk-message" rows={3} maxLength={2000} value={value.message} onChange={(e) => set('message')(e.target.value)} />
        <small className="bk-hint">{f.messageHint}</small>
      </label>
      {/* Honeypot: off screen and skipped by keyboard and autofill. */}
      <div className="bk-hp" aria-hidden="true">
        <label>
          Leave this empty
          <input tabIndex={-1} autoComplete="off" name="leave_empty" value={value.leave_empty} onChange={(e) => set('leave_empty')(e.target.value)} />
        </label>
      </div>
      <p className="bk-note">
        {t.privacy}
        <a href="/privacy">{t.privacyLink}</a>
      </p>
      {(error || hasErrors) && (
        <p className="bk-msg err" role="alert" id="bk-form-err">
          {error ?? t.errors.invalid}
        </p>
      )}
      <button className="btn pri bk-submit" type="submit" disabled={busy} aria-busy={busy}>
        {busy ? t.submitting : t.submit}
      </button>
    </form>
  );
}
