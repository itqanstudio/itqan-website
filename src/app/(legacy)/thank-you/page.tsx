import type { Metadata } from 'next';
import { ThankYouClient } from './ThankYouClient';

export const metadata: Metadata = {
  title: 'Message Received',
  description: "We've received your message and will be in touch within 48 hours.",
  // Post-conversion page — no SEO value, keep it out of the index. (No canonical:
  // a noindex page should not also self-canonicalize — that's a mixed signal.)
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return <ThankYouClient />;
}
