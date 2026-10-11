import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { PageHead, Rules, Section } from '@/components/portal/primitives';
import { Rich } from '@/components/v3/brand';

export const metadata: Metadata = portalMetadata({
  title: 'Positioning',
  description: 'Who Itqan builds AI for, and the line we say it in.',
  path: '/brand/positioning',
});

export default function PositioningPage() {
  return (
    <>
      <PageHead
        kicker="Foundations"
        title={<Rich value={['Private AI for the companies that ', 'make, move and sell.']} />}
        lead="Itqan is an AI studio. We build AI agents and private models for operations, supply chain and customer teams, and we run them inside the client’s own cloud account."
      />
      <Section title="The line">
        <p className="ts-h3" style={{ maxWidth: '28ch' }}>
          We build the AI your business runs on, and we stay to run it.
        </p>
        <p>
          The word that carries the line is <strong>runs</strong>. It appears under the logo, in bios and at the end of every company deck.
        </p>
      </Section>
      <Section title="Who it is for">
        <Rules
          items={[
            { title: 'Manufacturing', body: 'Supplier email, quality and maintenance logs, operating procedures, shift reports.' },
            { title: 'Retail', body: 'Store questions, customer messages on WhatsApp and email, product data, returns.' },
            { title: 'Food and beverage', body: 'Supplier orders, recipe and spec libraries, catering and booking requests.' },
            { title: 'The reader', body: 'The people who run operations, supply chain, IT and customer service, and the leaders who sign.' },
          ]}
        />
      </Section>
      <Section title="What we say, and what we do not">
        <Rules
          items={[
            { title: 'Your cloud, your region, your keys', body: 'Where the data lives is the first thing we talk about.', kind: 'yes' },
            { title: 'A first agent in three weeks', body: 'Concrete scope and a fixed window, with a person approving.', kind: 'yes' },
            { title: 'No certification claims', body: 'We do not claim an ISO or SOC 2 certificate until we hold one.', kind: 'no' },
            { title: 'No hype about replacing people', body: 'Agents take the paperwork; people make the calls.', kind: 'no' },
          ]}
        />
      </Section>
    </>
  );
}
