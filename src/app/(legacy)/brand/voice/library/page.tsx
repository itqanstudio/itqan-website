import type { Metadata } from 'next';
import { CopyBlock } from '@/components/brand/CopyBlock';
import { Callout, PortalPageBody, Section } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Copy library',
  description: 'Approved Itqan Studio boilerplate, taglines and service descriptions. Copy and paste rather than rewrite.',
};

const TAGLINES = [
  { label: 'Primary', meta: 'Use this one by default', text: 'Your brand has potential. We give it direction.' },
  { label: 'Short', meta: 'Where the full line will not fit', text: 'Clarity, precision and results.' },
  { label: 'On the name', meta: 'When the name needs explaining', text: 'Itqan: the Arabic word for excellence.' },
];

const BOILERPLATE = [
  {
    label: 'One line',
    meta: 'Directory listings, social bios',
    text: 'Itqan Studio is a brand and design studio working with founder-led companies on positioning, identity and the systems that carry them.',
  },
  {
    label: 'Short',
    meta: '~45 words · proposals, partner pages',
    text: 'Itqan Studio is a brand and design studio named after the Arabic word for excellence. It works with founder-led companies to decide what a brand is for, then builds the identity, the system and the site that carry that decision into the market.',
  },
  {
    label: 'Long',
    meta: '~90 words · press, About pages',
    text: 'Itqan Studio is a brand and design studio based in the UAE, named after the Arabic word for excellence — the kind that comes from doing a thing thoroughly rather than quickly. The studio works with founder-led companies that have momentum but no clear direction, starting with positioning rather than with a logo. Engagements typically cover brand strategy, visual identity, design systems and the website that carries them. The studio deliberately takes fewer clients in order to go further into each one.',
  },
];

const SERVICES = [
  {
    label: 'Brand strategy',
    meta: 'Service description',
    text: 'We decide what your brand is for, who it is for, and what it refuses to be — before anything gets designed. Everything downstream is easier once that is settled.',
  },
  {
    label: 'Visual identity',
    meta: 'Service description',
    text: 'The mark, the palette, the type and the rules that hold them together. Built as a system your team can run without us.',
  },
  {
    label: 'Web design and build',
    meta: 'Service description',
    text: 'The site as the place the positioning becomes visible. Designed and built together, so nothing is lost between the two.',
  },
];

export default function CopyLibraryPage() {
  return (
    <PortalPageBody href="/brand/voice/library"
      heroImage="/images/content-creation.png"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          Approved text at every length that gets asked for. Use these verbatim.
          If a version needs to change, change it here so every future copy is
          right rather than fixing one instance downstream.
        </p>
      </Section>

      <Section title="Taglines">
        <div className="space-y-3">
          {TAGLINES.map((t) => (
            <CopyBlock key={t.label} {...t} />
          ))}
        </div>
      </Section>

      <Section title="Boilerplate">
        <div className="space-y-3">
          {BOILERPLATE.map((b) => (
            <CopyBlock key={b.label} {...b} />
          ))}
        </div>
      </Section>

      <Section title="Services">
        <div className="space-y-3">
          {SERVICES.map((s) => (
            <CopyBlock key={s.label} {...s} />
          ))}
        </div>
      </Section>

      <Callout tone="note" title="Naming">
        Itqan Studio is two words, both capitalised. The legal entity is Itqan
        Studio FZ LLC and that form is used only in contracts and legal notices,
        never in marketing copy. Itqan is never translated inline — if the
        meaning matters, use the approved line about it.
      </Callout>
    </PortalPageBody>
  );
}
