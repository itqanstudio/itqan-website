import type { Metadata } from 'next';
import { VerifyButton } from '@/components/v3/admin/VerifyButton';
import { Symbol } from '@/components/v3/brand';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Confirm sign-in', referrer: 'no-referrer' };

/**
 * The emailed link lands here. Signing in needs a click, so a mail scanner that
 * opens the link cannot use up the one-time token.
 */
export default function Page({ searchParams }: { searchParams: { token?: string | string[] } }) {
  const token = typeof searchParams.token === 'string' ? searchParams.token : '';
  return (
    <div className="adm-auth">
      <span className="sym" style={{ width: 40 }}>
        <Symbol gid="adm-verify-sym" />
      </span>
      <h1>Sign in to the booking admin</h1>
      <VerifyButton token={token} />
    </div>
  );
}
