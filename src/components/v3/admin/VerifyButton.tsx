'use client';

import { useState } from 'react';

export function VerifyButton({ token }: { token: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle');
  const [error, setError] = useState('');

  const verify = async () => {
    setState('busy');
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (res.ok && body.ok) {
        window.location.replace('/admin');
        return;
      }
      setError(body.error ?? 'This link is not valid.');
      setState('error');
    } catch {
      setError('The connection dropped. Try again.');
      setState('error');
    }
  };

  if (!token) {
    return (
      <p className="bk-msg err">
        This link is incomplete. <a href="/admin/login">Ask for a new one.</a>
      </p>
    );
  }
  return (
    <div className="bk-form">
      <button className="btn pri" type="button" onClick={() => void verify()} disabled={state === 'busy'}>
        {state === 'busy' ? 'Signing in…' : 'Sign in'}
      </button>
      {state === 'error' && (
        <p className="bk-msg err" role="alert">
          {error} <a href="/admin/login">Ask for a new link.</a>
        </p>
      )}
    </div>
  );
}
