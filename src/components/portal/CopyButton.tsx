'use client';

import { useEffect, useRef, useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
  /** What is being copied, for screen readers: "Copy the boilerplate". */
  what?: string;
}

/** Copies a string and says so. When the clipboard is blocked, it asks the reader to select the text. */
export function CopyButton({ text, label = 'Copy', what }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setState('done');
    } catch {
      setState('failed');
    }
    timer.current = window.setTimeout(() => setState('idle'), 1800);
  };

  return (
    // No aria-label: it would override the live text, so "Copied" would never be read out.
    <button type="button" className="pt-copybtn" onClick={() => void copy()}>
      <span aria-live="polite">{state === 'done' ? 'Copied' : state === 'failed' ? 'Copy blocked, select the text' : label}</span>
      {what && state === 'idle' && <span className="sr-only"> {what}</span>}
    </button>
  );
}
