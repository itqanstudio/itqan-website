import manifest from "./brand-assets.json";
import type { AssetBundle, BrandAsset } from "@/components/portal/types";

/**
 * Typed accessors over the generated manifest.
 *
 * The JSON is written by scripts/sync-brand-assets.mjs and must never be edited
 * by hand. Importing it through this module keeps the `as` cast in exactly one
 * place instead of at every call site.
 */
export const ALL_ASSETS = manifest.assets as BrandAsset[];
export const ALL_BUNDLES = manifest.bundles as AssetBundle[];

export type BrandId = "itqan-studio";

export function assetsFor(brand: BrandId, categories?: string[]): BrandAsset[] {
  return ALL_ASSETS.filter(
    (a) => a.brand === brand && (!categories || categories.includes(a.category))
  );
}

/**
 * Bundles for a brand, optionally narrowed to given categories.
 *
 * The full "all" pack is returned ONLY for an unfiltered query (or one that
 * asks for it by name). Including it in every category-scoped call put a
 * 25 MB everything-pack next to the 5-file logo pack on the logo page, which
 * is why each caller had grown its own `.filter()` afterwards.
 */
export function bundlesFor(brand: BrandId, categories?: string[]): AssetBundle[] {
  return ALL_BUNDLES.filter(
    (b) => b.brand === brand && (!categories || categories.includes(b.category))
  );
}

/** Distinct categories present for a brand, in a stable, meaningful order. */
const CATEGORY_ORDER = ["logo", "sticker", "signature"];

export function categoriesFor(brand: BrandId): string[] {
  const present = new Set(assetsFor(brand).map((a) => a.category));
  return CATEGORY_ORDER.filter((c) => present.has(c));
}

export function assetBySlug(brand: BrandId, slug: string): BrandAsset | undefined {
  return ALL_ASSETS.find((a) => a.brand === brand && a.slug === slug);
}
