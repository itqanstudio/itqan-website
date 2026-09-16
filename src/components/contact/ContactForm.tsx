'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowRight } from '@phosphor-icons/react';
import { SPRING_SNAPPY } from '@/lib/motion';

type FormValues = {
  name: string;
  email: string;
  company: string;
  website: string;
  phone: string;
  /** Honeypot. Always empty for a real person. */
  referralCode: string;
  message: string;
};

// Focus ring is provided globally (*:focus-visible in globals.css) — no per-field
// focus styles here. Light = white fields / black borders / dark text; dark mode
// via dark: variants (cream text on a plum panel).
const inputClass =
  'w-full bg-white dark:bg-[rgba(255,251,245,0.04)] border border-black/[0.12] dark:border-[rgba(255,251,245,0.15)] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] dark:text-[#fffbf5] placeholder:text-[#9a9a9a] dark:placeholder:text-[rgba(255,251,245,0.4)] transition-colors duration-300';

const labelClass =
  'block text-xs font-semibold text-text-secondary dark:text-[rgba(255,251,245,0.75)] tracking-wide mb-2';

const errorClass = 'text-red-500 dark:text-red-400 text-xs mt-1.5';

interface ContactFormProps {
  /** Optional CTA intent (e.g. "ai-check", "identity-sprint"). Sent to /api/contact for context. */
  intent?: string;
}

export function ContactForm({ intent }: ContactFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onValid = async (values: FormValues) => {
    setSubmitError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, intent }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        router.push('/thank-you');
      } else {
        setSubmitError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please try again.');
    }
  };

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit(onValid)}
      className="space-y-5"
      noValidate
    >
      {/* Honeypot. Hidden from people and from assistive tech, so anything in it
          came from a bot; /api/contact then returns ok and sends nothing. Not
          named "website", because this form has a real website field. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="referralCode">Referral code</label>
        <input
          id="referralCode"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('referralCode')}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className={labelClass}>Name</label>
          <input
            id="name"
            type="text"
            placeholder="Your name"
            className={inputClass}
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            className={inputClass}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
            })}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="company" className={labelClass}>Company</label>
          <input
            id="company"
            type="text"
            placeholder="Company name"
            className={inputClass}
            {...register('company')}
          />
        </div>
        <div>
          <label htmlFor="website" className={labelClass}>Website</label>
          <input
            id="website"
            type="text"
            placeholder="yoursite.com"
            className={inputClass}
            {...register('website')}
          />
        </div>
      </div>

      {/* The budget dropdown was dropped on 16 Sep 2026: the Calendly booking form
          already asks the question, and asking it twice cost us replies. The API
          still accepts a `budget` field, so nothing breaks server-side. */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className={labelClass}>Phone</label>
          <input
            id="phone"
            type="tel"
            placeholder="+1 (000) 000-0000"
            className={inputClass}
            {...register('phone')}
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>Message</label>
        <textarea
          id="message"
          rows={5}
          placeholder="Tell us about your project..."
          className={`${inputClass} resize-none`}
          {...register('message', { required: 'Message is required' })}
        />
        {errors.message && <p className={errorClass}>{errors.message.message}</p>}
      </div>

      {submitError && <p className={errorClass}>{submitError}</p>}

      <motion.button
        type="submit"
        data-umami-event="contact_submit"
        data-umami-event-intent={intent ?? 'general'}
        disabled={isSubmitting}
        className="btn-gloss w-full inline-flex items-center justify-center gap-2 bg-brand-dark text-brand-cream dark:bg-brand-cream dark:text-brand-dark py-4 rounded-[10px] text-sm font-semibold hover:bg-[#241323] dark:hover:bg-brand-cream/90 transition-colors duration-200 disabled:opacity-60"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={SPRING_SNAPPY}
      >
        {isSubmitting ? 'Sending…' : 'Send Message'}
        <ArrowRight size={15} weight="bold" />
      </motion.button>
    </form>
  );
}
