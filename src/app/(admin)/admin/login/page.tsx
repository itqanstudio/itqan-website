import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/scheduling/http';
import { LoginForm } from '@/components/v3/admin/LoginForm';
import { Symbol } from '@/components/v3/brand';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Sign in' };

export default function Page() {
  if (currentAdmin()) redirect('/admin');
  return (
    <div className="adm-auth">
      <span className="sym" style={{ width: 40 }}>
        <Symbol gid="adm-login-sym" />
      </span>
      <h1>Booking admin</h1>
      <p className="lead">Enter your Itqan email. We send a sign-in link that works once, for 15 minutes.</p>
      <LoginForm />
    </div>
  );
}
