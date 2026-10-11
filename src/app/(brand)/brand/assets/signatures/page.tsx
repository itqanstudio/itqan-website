import type { Metadata } from 'next';
import { portalMetadata } from '@/lib/page-metadata';
import { assetsFor, bundlesFor } from '@/data/brand-library';
import { AssetGrid, PageHead, Rules, Section } from '@/components/portal/primitives';
import { Bundles } from '@/components/portal/Bundles';

export const metadata: Metadata = portalMetadata({
  title: 'Email signatures',
  description: 'The v3 email signature for the team, and how to install it in Gmail.',
  path: '/brand/assets/signatures',
});

export default function SignaturesPage() {
  return (
    <>
      <PageHead
        kicker="Resources"
        title="Email signatures"
        lead="One signature layout for the whole team: the lockup, name, role, and links. Table-based HTML with inline styles, so Gmail and Outlook render it the same. Its images are hosted on this site."
      />
      <Section title="Install in Gmail">
        <Rules
          items={[
            { title: '1. Open your signature file', body: 'Ask Ibrahim for the HTML file with your name, open it in Chrome.' },
            { title: '2. Copy it', body: 'Select all (Cmd+A) and copy (Cmd+C).' },
            { title: '3. Paste it', body: 'Gmail, Settings, See all settings, General, Signature, Create new, paste, Save changes at the bottom.' },
            { title: '4. Make it the default', body: 'Choose it for new emails and for replies.' },
          ]}
        />
      </Section>
      <Section title="The kit">
        <Bundles bundles={bundlesFor('itqan-studio', ['signature'])} />
        <AssetGrid assets={assetsFor('itqan-studio', ['signature'])} />
      </Section>
    </>
  );
}
