import { describe, expect, it } from 'vitest';
import { buildIcs, escapeText, foldLine, quoteParam, type IcsEvent } from './ics';

const encoder = new TextEncoder();
const unfold = (ics: string) => ics.replace(/\r\n /g, '');
const physicalLines = (ics: string) => ics.split('\r\n').filter((l) => l !== '');

const base: IcsEvent = {
  uid: '4f9a2b1c-0000-4000-8000-000000000001@itqanstudio.com',
  start: new Date('2026-10-12T06:00:00.000Z'),
  end: new Date('2026-10-12T06:30:00.000Z'),
  summary: 'Itqan briefing: Sara Ahmed, Example Foods',
  description: 'Guest: Sara Ahmed',
  organizerEmail: 'bookings@itqanstudio.com',
  organizerName: 'Itqan Studio',
  method: 'REQUEST',
  sequence: 0,
  now: new Date('2026-10-11T08:00:00.000Z'),
};

describe('escapeText (RFC 5545 TEXT)', () => {
  it('escapes backslash, semicolon and comma, and writes every line break as \\n', () => {
    expect(escapeText('a\\b;c,d')).toBe('a\\\\b\\;c\\,d');
    expect(escapeText('one\r\ntwo\rthree\nfour')).toBe('one\\ntwo\\nthree\\nfour');
  });
  it('writes the Unicode line breaks (NEL, line and paragraph separators) as \\n too, so no parser can split a value on them', () => {
    // Built from code points, so the source file holds no invisible characters.
    const nel = String.fromCodePoint(0x85);
    const ls = String.fromCodePoint(0x2028);
    const ps = String.fromCodePoint(0x2029);
    expect(escapeText(`one${nel}two${ls}three${ps}four`)).toBe('one\\ntwo\\nthree\\nfour');
    expect([nel, ls, ps].some((ch) => escapeText(`x${ch}DTSTART:20990101T000000Z`).includes(ch))).toBe(false);
  });
  it('drops control characters a TEXT value may not hold, and keeps a tab', () => {
    expect(escapeText('bell\u0007 null\u0000 esc\u001b del\u007f tab\there')).toBe('bell null esc del tab\there');
  });
});

describe('quoteParam', () => {
  it('keeps commas, colons and semicolons inside the quotes and removes double quotes', () => {
    expect(quoteParam('Ahmed, Sara')).toBe('"Ahmed, Sara"');
    expect(quoteParam('Sara "the boss": COO; Ops')).toBe('"Sara the boss: COO; Ops"');
    expect(quoteParam('  ')).toBe('"Itqan"');
  });
});

describe('foldLine', () => {
  it('leaves a line of 75 octets alone and folds a longer one at 75', () => {
    expect(foldLine('x'.repeat(75))).toBe('x'.repeat(75));
    const folded = foldLine('x'.repeat(200));
    expect(physicalLines(folded).every((l) => encoder.encode(l).length <= 75)).toBe(true);
    expect(unfold(folded)).toBe('x'.repeat(200));
  });
  it('never splits an Arabic letter (two octets each) across lines', () => {
    const line = `DESCRIPTION:${'سارة أحمد، شركة الأغذية '.repeat(10)}`;
    const folded = foldLine(line);
    const decoder = new TextDecoder('utf-8', { fatal: true });
    for (const l of physicalLines(folded)) {
      expect(encoder.encode(l).length).toBeLessThanOrEqual(75);
      expect(() => decoder.decode(encoder.encode(l))).not.toThrow();
    }
    expect(unfold(folded)).toBe(line);
  });
});

describe('buildIcs', () => {
  const founders: IcsEvent['attendees'] = [
    { name: 'Ibrahim Shareef', email: 'ibrahim@itqanstudio.com', role: 'REQ-PARTICIPANT' },
    { name: 'Aslam, Bisma', email: 'bisma@itqanstudio.com', role: 'OPT-PARTICIPANT' },
  ];

  it('writes an invitation: METHOD:REQUEST, the organizer, one ATTENDEE per person asked to answer', () => {
    const ics = buildIcs({ ...base, attendees: founders });
    const lines = physicalLines(unfold(ics));
    expect(lines).toContain('METHOD:REQUEST');
    expect(lines).toContain('UID:4f9a2b1c-0000-4000-8000-000000000001@itqanstudio.com');
    expect(lines).toContain('SEQUENCE:0');
    expect(lines).toContain('DTSTAMP:20261011T080000Z');
    expect(lines).toContain('DTSTART:20261012T060000Z');
    expect(lines).toContain('DTEND:20261012T063000Z');
    expect(lines).toContain('SUMMARY:Itqan briefing: Sara Ahmed\\, Example Foods');
    expect(lines).toContain('ORGANIZER;CN="Itqan Studio":mailto:bookings@itqanstudio.com');
    expect(lines).toContain(
      'ATTENDEE;CN="Ibrahim Shareef";ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:ibrahim@itqanstudio.com'
    );
    expect(lines).toContain('ATTENDEE;CN="Aslam, Bisma";ROLE=OPT-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:bisma@itqanstudio.com');
    expect(lines).toContain('STATUS:CONFIRMED');
    expect(ics.endsWith('\r\n')).toBe(true);
    // Every physical line is CRLF-terminated and at most 75 octets.
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
    expect(physicalLines(ics).every((l) => encoder.encode(l).length <= 75)).toBe(true);
  });

  it('writes the cancel with the same UID, a higher sequence and STATUS:CANCELLED', () => {
    const lines = physicalLines(unfold(buildIcs({ ...base, method: 'CANCEL', sequence: 1, attendees: founders })));
    expect(lines).toContain('METHOD:CANCEL');
    expect(lines).toContain('UID:4f9a2b1c-0000-4000-8000-000000000001@itqanstudio.com');
    expect(lines).toContain('SEQUENCE:1');
    expect(lines).toContain('STATUS:CANCELLED');
    expect(lines.filter((l) => l.startsWith('ATTENDEE;'))).toHaveLength(2);
  });

  it('keeps PUBLISH without attendees', () => {
    const ics = buildIcs({ ...base, method: 'PUBLISH' });
    expect(ics).toContain('METHOD:PUBLISH');
    expect(ics).not.toContain('ATTENDEE');
  });

  it('folds a long Arabic description and an Arabic attendee name, and they unfold to what was given', () => {
    const description = `ملاحظات: ${'نريد وكيلاً يتولى طلبات التموين، ويرد على العملاء.\n'.repeat(6)}`;
    const ics = buildIcs({ ...base, description, attendees: [{ name: 'بسمة أسلم، المؤسِّسة', email: 'bisma@itqanstudio.com', role: 'OPT-PARTICIPANT' }] });
    const unfolded = physicalLines(unfold(ics));
    expect(unfolded).toContain(`DESCRIPTION:${escapeText(description)}`);
    expect(unfolded).toContain('ATTENDEE;CN="بسمة أسلم، المؤسِّسة";ROLE=OPT-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:bisma@itqanstudio.com');
    expect(physicalLines(ics).every((l) => encoder.encode(l).length <= 75)).toBe(true);
  });

  it('cannot be broken out of by a calendar address', () => {
    const ics = buildIcs({ ...base, organizerEmail: 'a@b.c\r\nATTENDEE:mailto:x@y.z', attendees: [{ name: 'X', email: 'x@y.z\nEND:VEVENT', role: 'OPT-PARTICIPANT' }] });
    expect(physicalLines(unfold(ics)).filter((l) => l === 'END:VEVENT')).toHaveLength(1);
    expect(physicalLines(unfold(ics)).filter((l) => l.startsWith('ATTENDEE'))).toHaveLength(1);
  });
});
