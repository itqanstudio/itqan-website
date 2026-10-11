/**
 * iCalendar (RFC 5545, with the iTIP methods of RFC 5546) for one briefing.
 * PUBLISH adds the event to a calendar (the guest's copy); REQUEST is a real
 * invitation with attendees (the founders' copy); CANCEL with the same UID and
 * a higher SEQUENCE removes either again.
 */
export type IcsMethod = 'PUBLISH' | 'REQUEST' | 'CANCEL';

export interface IcsAttendee {
  name: string;
  email: string;
  /** The person who takes the call is required; anyone else on the invite is optional. */
  role: 'REQ-PARTICIPANT' | 'OPT-PARTICIPANT';
}

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
  /** Invitees (REQUEST, and the CANCEL that withdraws it): each asked to answer. */
  attendees?: readonly IcsAttendee[];
  method: IcsMethod;
  sequence: number;
  now?: Date;
}

function stamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * NEL (U+0085), LINE SEPARATOR (U+2028) and PARAGRAPH SEPARATOR (U+2029): RFC
 * 5545 ends a line only at CRLF, but a parser that splits on Unicode line
 * breaks would start a new property there. Built from code points, so this file
 * holds no invisible characters.
 */
const UNICODE_BREAKS = new RegExp(`[${String.fromCodePoint(0x85, 0x2028, 0x2029)}]`, 'g');

/**
 * A TEXT value (RFC 5545 3.3.11): backslash, semicolon and comma escaped, every
 * line break (CRLF, CR, LF, or a Unicode one) written as \n, and the control
 * characters TEXT may not hold removed (a tab is allowed).
 */
export function escapeText(value: string): string {
  return value
    .replace(UNICODE_BREAKS, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/**
 * A parameter value (RFC 5545 3.2): quoted, with the characters a quoted value
 * cannot hold removed (double quotes and control characters). Commas, colons and
 * semicolons are safe inside the quotes.
 */
export function quoteParam(value: string): string {
  return `"${value.replace(/["\u0000-\u001f\u007f]/g, '').trim() || 'Itqan'}"`;
}

/** A calendar address: mailto plus the address, with anything that could end the line or the value removed. */
function calAddress(email: string): string {
  return `mailto:${email.replace(/[\u0000-\u001f\u007f\s"]/g, '')}`;
}

/** Lines longer than 75 octets are folded with CRLF and a space (RFC 5545 3.1), never inside a character. */
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

function attendeeLine(a: IcsAttendee): string {
  return `ATTENDEE;CN=${quoteParam(a.name)};ROLE=${a.role};PARTSTAT=NEEDS-ACTION;RSVP=TRUE:${calAddress(a.email)}`;
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
    `ORGANIZER;CN=${quoteParam(e.organizerName ?? 'Itqan')}:${calAddress(e.organizerEmail)}`,
    ...(e.attendees ?? []).map(attendeeLine),
    `STATUS:${e.method === 'CANCEL' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}
