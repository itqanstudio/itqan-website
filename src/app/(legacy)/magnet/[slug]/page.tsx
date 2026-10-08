import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findItqanMagnetBySlug, type LeadMagnet } from "@/lib/magnet-lookup";
import { MagnetLanding } from "@/components/magnet/MagnetLanding";

// Always fetch fresh from Notion (magnets are edited in Notion, we want
// the latest text on every visit). For a production-scale site we would
// add ISR with a 60-300 sec revalidate, but for now full dynamic works.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// The lead-magnet funnel is gated on NOTION_TOKEN: the landing pages are backed
// by the Notion magnet registry, so with no token there is nothing to render.
// While it's unset the funnel is intentionally OFF and these routes 404 (not
// 500) — set NOTION_TOKEN in the environment to revive the whole funnel.
const MAGNETS_ENABLED = !!process.env.NOTION_TOKEN;

/**
 * Resolve a magnet, degrading any lookup failure (missing token, Notion outage)
 * to null so the route renders a clean 404 instead of throwing a 500.
 */
async function resolveMagnet(slug: string): Promise<LeadMagnet | null> {
  if (!MAGNETS_ENABLED) return null;
  try {
    return await findItqanMagnetBySlug(slug);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[magnet] lookup failed:", msg);
    return null;
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const magnet = await resolveMagnet(slug);
  if (!magnet) {
    return {
      title: "Guide not found · Itqan Studio",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${magnet.title} · Free Guide by Itqan Studio`,
    description: magnet.landingTeaser
      .slice(0, 160)
      .replace(/[#*\n]+/g, " ")
      .trim(),
    alternates: { canonical: `/magnet/${slug}` },
    openGraph: {
      title: magnet.title,
      description: magnet.landingTeaser
        .slice(0, 200)
        .replace(/[#*\n]+/g, " ")
        .trim(),
      type: "article",
    },
  };
}

export default async function MagnetPage({ params }: Props) {
  const { slug } = await params;
  const magnet = await resolveMagnet(slug);
  if (!magnet) notFound();
  return <MagnetLanding magnet={magnet} />;
}
