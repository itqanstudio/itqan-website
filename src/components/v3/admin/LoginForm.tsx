'use client';

import { useState, type FormEvent } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('busy');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (res.ok && body.ok) {
        setState('sent');
        return;
      }
      setError(body.error ?? 'Could not send the link.');
      setState('error');
    } catch {
      setError('The connection dropped. Try again.');
      setState('error');
    }
  };

  if (state === 'sent') {
    return (
      <p className="bk-msg ok" role="status">
        If {email} is an admin address, a sign-in link is on its way. Check the inbox, and the spam folder.
      </p>
    );
  }
  return (
    <form className="bk-form" onSubmit={submit}>
      <label>
        <span>Email</span>
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {state === 'error' && (
        <p className="bk-msg err" role="alert">
          {error}
        </p>
      )}
      <button className="btn pri" type="submit" disabled={state === 'busy'}>
        {state === 'busy' ? 'Sending…' : 'Email me a sign-in link'}
      </button>
    </form>
  );
}
