import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { BANNED_WORDS, VOICE_RULES } from '@/data/brand-spec';
import { PageHead, Rules, Section } from '@/components/portal/primitives';
import { Rich } from '@/components/v3/brand';

export const metadata: Metadata = portalMetadata({
  title: 'Voice',
  description: 'Plain sentences with a fact in each. How Itqan writes.',
  path: '/brand/voice',
});

export default function VoicePage() {
  return (
    <>
      <PageHead
        kicker="Expression"
        title={<Rich value={['A fact ', 'in every sentence.']} />}
        lead="Itqan writes the way a good operations lead talks: short sentences, real numbers, the name of the thing. In Arabic, English and Swedish, and in the reader’s language when they write first."
      />
      <Section title="Rules, with a line from the site">
        <div className="pt-cards">
          {VOICE_RULES.map((v) => (
            <div key={v.rule}>
              <h3>{v.rule}</h3>
              <p>“{v.example}”</p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Words we do not use">
        <Rules items={BANNED_WORDS.map((w) => ({ title: w, body: 'Say what actually happens instead.', kind: 'no' as const }))} />
      </Section>
      <Section title="Arabic">
        <Rules
          items={[
            { title: 'Written for an Arabic reader', body: 'Not translated word for word. The facts stay the same; the sentence is rebuilt.' },
            { title: 'Western digits', body: 'As on most UAE business sites: 30 دقيقة, not ٣٠ دقيقة.' },
            { title: 'Names stay in their script', body: 'Client and product names keep the spelling the client uses, often Latin.' },
          ]}
        />
      </Section>
    </>
  );
}
