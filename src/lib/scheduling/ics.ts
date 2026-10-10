/**
 * iCalendar (RFC 5545) for one briefing. PUBLISH adds the event to a calendar;
 * CANCEL with the same UID and a higher SEQUENCE removes it again.
 */
export interface IcsEvent {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location?: string;
  organizerEmail: string;
  /** Display name for the organizer, e.g. the host. Defaults to "Itqan". */
  organizerName?: string;
  method: 'PUBLISH' | 'CANCEL';
  sequence: number;
  now?: Date;
}

function stamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/**
 * A parameter value (RFC 5545 3.2): quoted, with the characters a quoted value
 * cannot hold removed (double quotes and control characters).
 */
export function quoteParam(value: string): string {
  return `"${value.replace(/["\u0000-\u001f\u007f]/g, '').trim() || 'Itqan'}"`;
}

/** Lines longer than 75 octets are folded with CRLF and a space (RFC 5545 3.1). */
const encoder = new TextEncoder();

export function foldLine(line: string): string {
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  let size = 0;
  for (const ch of line) {
    const len = encoder.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74;
    if (size + len > limit) {
      parts.push(current);
      current = '';
      size = 0;
    }
    current += ch;
    size += len;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

export function buildIcs(e: IcsEvent): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Itqan Studio//Briefings//EN',
    'CALSCALE:GREGORIAN',
    `METHOD:${e.method}`,
    'BEGIN:VEVENT',
    `UID:${e.uid}`,
    `SEQUENCE:${e.sequence}`,
    `DTSTAMP:${stamp(e.now ?? new Date())}`,
    `DTSTART:${stamp(e.start)}`,
    `DTEND:${stamp(e.end)}`,
    `SUMMARY:${escapeText(e.summary)}`,
    `DESCRIPTION:${escapeText(e.description)}`,
    ...(e.location ? [`LOCATION:${escapeText(e.location)}`] : []),
    `ORGANIZER;CN=${quoteParam(e.organizerName ?? 'Itqan')}:mailto:${e.organizerEmail.replace(/[\r\n]/g, '')}`,
    `STATUS:${e.method === 'CANCEL' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}
