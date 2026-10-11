/** One downloadable file in the brand asset manifest (src/data/brand-assets.json). */
export interface BrandAsset {
  id: string;
  brand: string;
  category: string;
  name: string;
  slug: string;
  format: string;
  bytes: number;
  src?: string;
  width?: number;
  height?: number;
  sourceOnly?: boolean;
}

/** A zip of one category, built at prebuild by scripts/build-brand-bundles.mjs. */
export interface AssetBundle {
  brand: string;
  category: string;
  href: string;
  count: number;
  bytes: number;
}
