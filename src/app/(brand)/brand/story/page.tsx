import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { PageHead, Rules, Section } from '@/components/portal/primitives';
import { Rich, Symbol } from '@/components/v3/brand';

export const metadata: Metadata = portalMetadata({
  title: 'Story and principles',
  description: 'What itqan means, and the idea behind the signal i.',
  path: '/brand/story',
});

export default function StoryPage() {
  return (
    <>
      <PageHead
        kicker="Foundations"
        title={<Rich value={['Itqan is Arabic for ', 'work done properly.']} />}
        lead="إتقان is doing a thing so carefully that nobody has to check it twice. For an AI studio that is the whole job: an agent that still answers correctly in month twelve, after the price list has changed and the model has been upgraded."
      />
      <Section title="The symbol is the idea">
        <div className="pt-split">
          <figure className="pt-stage glow">
            <span className="pt-sym">
              <Symbol gid="story-sym" title="The Itqan symbol" />
            </span>
          </figure>
          <Rules
            items={[
              { title: 'The stem and the dot are an i.', body: 'The first letter of itqan, so the symbol works alone as an initial on an app icon, a favicon or a cap.' },
              { title: 'The stem is also alef, ا.', body: 'The first letter of إتقان. The same mark reads in both scripts.' },
              { title: 'The arcs are the old logo.', body: 'Three bands radiate from the bottom-left corner, the corner the earlier arc grew from.' },
              { title: 'The dot is the resolved pixel.', body: 'In motion everything scatters and springs home; the rose dot lands last.' },
            ]}
          />
        </div>
      </Section>
      <Section title="Four principles">
        <Rules
          items={[
            { title: 'Owned by the client', body: 'Code, prompts, test sets and the cloud account belong to the client from day one.', kind: 'yes' },
            { title: 'A person decides', body: 'Anything that leaves a company goes past a person first.', kind: 'yes' },
            { title: 'Tested, then run', body: 'Agents pass a test set before launch and again every week after.', kind: 'yes' },
            { title: 'Said plainly', body: 'Numbers and names instead of adjectives, in Arabic, English and Swedish.', kind: 'yes' },
          ]}
        />
      </Section>
    </>
  );
}
