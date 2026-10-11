import { fmtBytes } from './primitives';
import type { AssetBundle } from './types';

const LABEL: Record<string, string> = { logo: 'Logo pack', sticker: 'Sticker pack', signature: 'Signature kit', all: 'Everything' };

/** Zip downloads, built at prebuild from the same files the grid shows. */
export function Bundles({ bundles }: { bundles: readonly AssetBundle[] }) {
  if (bundles.length === 0) return null;
  return (
    <div className="pt-bundles">
      {bundles.map((b) => (
        <a key={b.href} className="btn" href={b.href} download>
          {LABEL[b.category] ?? b.category} · {b.count} files · {fmtBytes(b.bytes)} ↓
        </a>
      ))}
    </div>
  );
}
