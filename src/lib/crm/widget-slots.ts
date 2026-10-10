import type { SlotsData } from './contract';

/**
 * What the booking widget reads from GET /api/book/slots: the shape it had
 * before the CRM (`slots` as UTC ISO strings, `slotMinutes`, `timezone`) plus
 * the hosts. Which host is free at which time stays on the server; the CRM
 * picks the host when the booking is made.
 */
export interface WidgetSlots {
  slots: string[];
  slotMinutes: number;
  timezone: string;
  hosts: Array<{ slug: string; name: string }>;
}

export function toWidgetSlots(data: SlotsData): WidgetSlots {
  const starts = Array.from(new Set(data.slots.map((s) => s.start))).sort();
  return {
    slots: starts,
    slotMinutes: data.slotMinutes,
    timezone: data.timezone,
    hosts: data.hosts.map((h) => ({ slug: h.slug, name: h.name })),
  };
}
