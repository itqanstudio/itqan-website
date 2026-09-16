import type { Metadata } from 'next';
import { HeroAxion } from '@/components/home/HeroAxion';
import { IntroPartner } from '@/components/home/IntroPartner';
import { CasesAxion } from '@/components/home/CasesAxion';
import { ThreePillars } from '@/components/home/ThreePillars';
import { WhyRebrandsFail } from '@/components/home/WhyRebrandsFail';
import { Guarantee } from '@/components/home/Guarantee';
import { WhoFor } from '@/components/home/WhoFor';
import { Portrait } from '@/components/home/Portrait';
import { AskAI } from '@/components/home/AskAI';
import { PartnerHalo } from '@/components/home/PartnerHalo';
import { CTABanner } from '@/components/home/CTABanner';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

/**
 * Home, version 2 (16 Sep 2026). The page now sells the system an owner-led
 * business runs on, not a rebrand: problem, what we build, proof, the four rungs,
 * what happens after go-live, who it is for, verification, the two people, the ask.
 * Section badge numbers follow this order, so reordering means renumbering.
 *
 * Three components were left unrendered by this rewrite and are now referenced
 * nowhere: Industries (its claim is carried by "Who this is for"), AiVisibility
 * (the simulated AI chat, dropped from the hero) and FounderOS (the old three
 * phase model, dropped from /services when that page became the four steps).
 * They are kept on disk deliberately, not because anything imports them. Delete
 * them once the new positioning has been live long enough to be sure.
 */
export default function HomePage() {
  return (
    <>
      {/* The offer, in one sentence */}
      <HeroAxion />
      {/* 1 — If this sounds like your Monday: the problem in the owner's words */}
      <IntroPartner />
      {/* 2 — What we build: one system, three parts */}
      <ThreePillars />
      {/* 3 — Proof, not promises: Lemon Garden, then Millow */}
      <CasesAxion />
      {/* 4 — How it works: the four rungs, cheapest first */}
      <WhyRebrandsFail />
      {/* 5 — After go-live: Care or Partner, and the date guarantee */}
      <Guarantee />
      {/* 6 — Who this is for, and who it is not */}
      <WhoFor />
      {/* 7 — Verify us in a tool we do not control */}
      <AskAI />
      {/* 8 — The two people who do the work */}
      <Portrait />
      {/* Gated named-partner halo slot — renders nothing until NEXT_PUBLIC_PARTNER_HALO=1 */}
      <PartnerHalo />
      {/* The ask: tell us the one thing that is stuck */}
      <CTABanner />
    </>
  );
}
