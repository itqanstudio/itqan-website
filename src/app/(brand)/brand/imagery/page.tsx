import type { Metadata } from 'next';
import Image from 'next/image';
import { portalMetadata } from '@/lib/page-metadata';
import { ICON_SET } from '@/data/brand-spec';
import { PageHead, Rules, Section } from '@/components/portal/primitives';
import { PixelIcon, Rich } from '@/components/v3/brand';
import { isIconName } from '@/lib/v3/brand';

export const metadata: Metadata = portalMetadata({
  title: 'Imagery and icons',
  description: 'Rose gel light, pixel bokeh, and the pixel icon set.',
  path: '/brand/imagery',
});

export default function ImageryPage() {
  return (
    <>
      <PageHead
        kicker="Expression"
        title={<Rich value={['People ', 'in the light.']} />}
        lead="One light source in rose and apricot gel, a long-exposure ghost, and bokeh that falls into square pixels. The same treatment applies to every person we photograph."
      />
      <Section title="Photography">
        <figure className="pt-stage ink" style={{ padding: 0, aspectRatio: '16 / 9', minHeight: 0 }}>
          <Image src="/v3/img/ceo-0.jpg" alt="Ibrahim Shareef, founder and CEO of Itqan, in a white kandura and ghutra under rose light with square bokeh" fill sizes="(max-width: 900px) 100vw, 1040px" style={{ objectFit: 'cover' }} />
        </figure>
        <Rules
          items={[
            { title: 'One gel light', body: 'Rose and apricot from one side, the rest of the frame falling to ink.', kind: 'yes' },
            { title: 'Square bokeh', body: 'Out-of-focus light renders as pixel squares, echoing the symbol.', kind: 'yes' },
            { title: 'Real work and real people', body: 'Factories, stores, kitchens and the team. Generated images are approved by a person before they go public.', kind: 'yes' },
            { title: 'No stock robots or glowing brains', body: 'No blue circuit boards, humanoid robots or floating holograms.', kind: 'no' },
          ]}
        />
      </Section>
      <Section title="Icons">
        <p>
          Drawn on a 24-pixel grid, from <a href="https://pixelarticons.com">pixelarticons</a> by Gerrit Halfmann (MIT licence). One treatment per surface, never smaller than 16 px, never mixed with another icon set.
        </p>
        <div className="pt-cards">
          {ICON_SET.filter((i) => isIconName(i.name)).map((icon, n) => (
            <div key={icon.name} style={{ gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: 14 }}>
              {isIconName(icon.name) && <PixelIcon name={icon.name} treatment="grad" gid={`img-ic-${n}`} className="pt-ic" />}
              <span>
                <b style={{ display: 'block', fontSize: 15 }}>{icon.meaning}</b>
                <span className="pt-cap">{icon.name}</span>
              </span>
            </div>
          ))}
        </div>
        <Rules
          items={[
            { title: 'Gradient tile', body: 'Ink glyph on a dusk tile. Feature icons and Instagram highlight covers.' },
            { title: 'Line on ink', body: 'Bone glyph on ink. Navigation, product screens, dense lists.' },
            { title: 'Gradient glyph', body: 'The glyph in dusk on ink. One per view, for the hero moment of a section.' },
          ]}
        />
      </Section>
    </>
  );
}
