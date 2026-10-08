import type { Metadata } from 'next';
import { AssetLibrary } from '@/components/brand/AssetLibrary';
import { assetsFor, bundlesFor } from '@/data/brand-library';
import { Callout, PortalPageBody, RuleGrid, Section, SpecTable } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Email signatures',
  description: 'Hosted Itqan Studio email signature assets, with the specs mail clients actually respect.',
};

const assets = assetsFor('itqan-studio', ['signature']);
const bundles = bundlesFor('itqan-studio', ['signature']);

export default function SignaturesPage() {
  return (
    <PortalPageBody href="/brand/assets/signatures"
      heroImage="/images/portfolio/ITQAN-CRM-MKP-MCBK.png"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          Email is the most hostile rendering environment the brand appears in,
          and the one clients see most often. The signature set is built for it:
          raster where clients refuse SVG, vector where they allow it, and
          separate cuts for light and dark mail themes.
        </p>
      </Section>

      <Section title="Which file">
        <SpecTable
          columns={['Client / theme', 'File', 'Notes']}
          rows={[
            ['Gmail, light theme', 'itqan-sig-light', 'The default for most recipients.'],
            ['Gmail, dark theme', 'itqan-sig-gmaildark', 'Gmail inverts backgrounds; this cut survives it.'],
            ['Apple Mail / Outlook dark', 'itqan-sig-dark', 'Drawn for a genuinely dark canvas.'],
            ['Icon row', 'icon-*.png / icon-*.svg', 'PNG for Outlook, SVG everywhere else.'],
            ['Divider', 'rule-*', 'The accent rule between the name block and the links.'],
          ]}
        />
      </Section>

      <Callout tone="warning" title="Outlook">
        Outlook on Windows renders through Word. It ignores SVG, most modern CSS
        and any image without explicit width and height attributes. Use the PNG
        cuts there and set dimensions in the HTML, not in CSS.
      </Callout>

      <AssetLibrary assets={assets} bundles={bundles} categories={['signature']} />

      <Section title="Rules">
        <RuleGrid
          rules={[
            { kind: 'do', text: 'Set explicit width and height on every image tag.' },
            { kind: 'do', text: 'Keep the whole signature under 100KB — some clients clip long messages.' },
            { kind: 'do', text: 'Give every icon real alt text; blocked images are the normal case, not the edge case.' },
            { kind: 'do', text: 'Use the accent cut that matches the signature background, not the one you prefer.' },
            { kind: 'dont', text: 'Do not use a background image. Most clients strip it and you get bare text.' },
            { kind: 'dont', text: 'Do not add a quote, a disclaimer, or a second logo.' },
            { kind: 'dont', text: 'Do not include a photo. The mark is the signature.' },
          ]}
        />
      </Section>
    </PortalPageBody>
  );
}
