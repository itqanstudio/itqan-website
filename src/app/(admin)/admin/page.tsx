import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/scheduling/http';
import { availableSlots, getAvailability, listBlockedDates, listBookings, purgeExpired } from '@/lib/scheduling/repo';
import { AdminDashboard } from '@/components/v3/admin/AdminDashboard';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Bookings' };

const DAY = 86_400_000;

export default function Page() {
  const email = currentAdmin();
  if (!email) redirect('/admin/login');
  purgeExpired();
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  return (
    <AdminDashboard
      email={email}
      upcoming={listBookings({ from: nowIso, includeCancelled: true })}
      past={listBookings({ from: new Date(now - 30 * DAY).toISOString(), to: nowIso })}
      availability={getAvailability()}
      blocked={listBlockedDates()}
      nextSlots={availableSlots(now).slots.slice(0, 8)}
    />
  );
}
