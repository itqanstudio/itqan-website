'use client';

import { useState } from 'react';

/** Copies a string and says so; falls back to selecting the text when the clipboard is blocked. */
export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState('done');
    } catch {
      setState('failed');
    }
    window.setTimeout(() => setState('idle'), 1800);
  };

  return (
    <button type="button" className="pt-copybtn" onClick={() => void copy()} aria-live="polite">
      {state === 'done' ? 'Copied' : state === 'failed' ? 'Select and copy' : label}
    </button>
  );
}
