'use client';

import type { Availability, BlockedDate, Booking } from '@/lib/scheduling/types';
import { adminCall, fmtInZone } from './api';
import { BookingsList } from './BookingsList';
import { HoursEditor } from './HoursEditor';
import { DaysOff } from './DaysOff';

interface AdminDashboardProps {
  email: string;
  upcoming: Booking[];
  past: Booking[];
  availability: Availability;
  blocked: BlockedDate[];
  nextSlots: string[];
}

export function AdminDashboard({ email, upcoming, past, availability, blocked, nextSlots }: AdminDashboardProps) {
  const tz = availability.timezone;
  const signOut = async () => {
    await adminCall('/api/admin/logout', 'POST');
    window.location.assign('/admin/login');
  };
  return (
    <div className="adm-wrap">
      <header className="adm-top">
        <div>
          <p className="k">
            <b>Itqan</b> · booking admin
          </p>
          <h1>Bookings and availability</h1>
        </div>
        <div className="btns">
          <a className="btn" href="/book" target="_blank" rel="noopener noreferrer">
            Open the booking page ↗
          </a>
          <button type="button" className="btn" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
        <p className="adm-who">Signed in as {email}</p>
      </header>

      <section className="adm-card" aria-labelledby="adm-next">
        <h2 id="adm-next">Next free times people see</h2>
        {nextSlots.length === 0 ? (
          <p className="adm-muted">No free times. Check the weekly hours, the notice period and the days off below.</p>
        ) : (
          <ul className="adm-chips">
            {nextSlots.map((s) => (
              <li key={s}>{fmtInZone(s, tz, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}</li>
            ))}
          </ul>
        )}
        <p className="adm-muted">Shown in {tz.replace(/_/g, ' ')}. Visitors see the same times in their own time zone.</p>
      </section>

      <BookingsList title="Upcoming" bookings={upcoming} tz={tz} cancellable />
      <HoursEditor initial={availability} />
      <DaysOff initial={blocked} tz={tz} />
      <BookingsList title="Last 30 days" bookings={past} tz={tz} collapsed />
    </div>
  );
}
