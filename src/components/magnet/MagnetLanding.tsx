"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import type { LeadMagnet } from "@/lib/magnet-lookup";
import { testimonials, type Testimonial } from "@/data/testimonials";
import { Arrow, Symbol } from "@/components/v3/brand";
import "@/styles/v3/forms.css";
import "@/styles/v3/magnet.css";

/**
 * Itqan lead magnet landing page, brand v3 (re-skinned 11 Oct 2026).
 *
 * Renders inside the v3 English layout, so the site nav and footer frame it.
 * The offer content and its sources are unchanged from the approved funnel:
 *   - magnet.title: editorial title from Notion. One word may be wrapped in
 *     single asterisks; it renders in the dusk gradient.
 *   - magnet.landingTeaser: the ~150-word hook (Body property in Notion)
 *   - the full ~1200-word PDF content stays in page children blocks (PDF only)
 *
 * Sections: sticky capture bar, hero, power statement, inside and audience
 * panels, featured project, testimonial, final capture.
 *
 * Motion: scroll reveals come from the site's <Reveal /> (data-reveal), which
 * springs from the current state and is skipped under reduced motion. Hover
 * states are CSS transitions, so they reverse from wherever they are.
 */

type Status = "idle" | "submitting" | "success" | "error";

interface CaptureState {
  email: string;
  setEmail: (v: string) => void;
  status: Status;
  downloadUrl: string | null;
  onSubmit: (e: FormEvent) => void;
}

export function MagnetLanding({ magnet }: { magnet: LeadMagnet }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  // PDF URL confirmed by the capture API on success, used for the instant
  // on-page download button. Falls back to the magnet's own pdfUrl.
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const featuredProject = useMemo(() => pickFeaturedProject(magnet.topicSlug), [magnet.topicSlug]);
  const testimonial = useMemo(() => pickTestimonial(magnet.topicSlug), [magnet.topicSlug]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      // No `pdfUrl` is sent: the delivered link is built SERVER-SIDE from our own
      // origin, so the client can never choose the URL we email (open-relay
      // hardening). dmKeyword only namespaces the subscriber tag.
      const res = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          magnetSlug: magnet.topicSlug,
          dmKeyword: magnet.dmKeyword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong. Try again.");
        return;
      }
      // Prefer the URL the server confirmed; fall back to the magnet's own.
      setDownloadUrl(data.pdfUrl ?? magnet.pdfUrl ?? null);
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Try again.");
    }
  }

  const capture: CaptureState = { email, setEmail, status, downloadUrl, onSubmit: handleSubmit };

  return (
    <div className="mg">
      <CaptureBar {...capture} />

      <section className="mg-hero" aria-labelledby="mg-title">
        <div className="wrap">
          <p className="k">
            <b>■</b> Itqan Studio · Free blueprint
          </p>
          <h1 id="mg-title">{renderTitleWithAccent(magnet.title)}</h1>
          <p className="lead">
            {magnet.landingTeaser ||
              "From invisible to inevitable in 90 days. The blueprint we hand every founder before we quote them."}
          </p>
          <a className="mg-cue" href="#mg-inside">
            Read <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section className="mg-say" aria-label="Why this document exists">
        <div className="wrap" data-reveal>
          <span className="sym">
            <Symbol gid="mg-say-sym" />
          </span>
          <p>
            A brand is a <span className="g">working document</span>, not a logo. This is the working
            document.
          </p>
        </div>
      </section>

      <section className="s" id="mg-inside" aria-labelledby="mg-inside-title">
        <div className="wrap">
          <div className="head" data-reveal>
            <p className="k">
              <b>■</b> The document
            </p>
            <h2 id="mg-inside-title">
              Two questions <span className="g">most</span> founders skip.
            </h2>
          </div>
          <div className="mg-panels" data-reveal>
            <Panel num="01" tag="Inside" {...INSIDE_PANEL_DEFAULTS} />
            <Panel num="02" tag="Audience" {...AUDIENCE_PANEL_DEFAULTS} />
          </div>
        </div>
      </section>

      <section className="s" aria-labelledby="mg-feat-title">
        <div className="wrap mg-feat">
          <div className="txt" data-reveal>
            <p className="k">
              <b>■</b> Reference foundation
            </p>
            <h2 id="mg-feat-title">
              A real Itqan <span className="g">brand foundation</span>, redacted.
            </h2>
            <p>
              We&apos;ve stripped the names and replaced the proprietary positioning, but the
              structure, exercises, and decision logs are intact. Use it as the template. Use it as
              the proof. It&apos;s the artifact behind every engagement.
            </p>
            <p className="lab">Featured: {featuredProject.label}.</p>
          </div>
          <div className="mg-shot" data-reveal>
            <Image src={featuredProject.src} alt={featuredProject.alt} fill sizes="(max-width: 900px) 100vw, 55vw" />
          </div>
        </div>
      </section>

      <section className="s" aria-label="What a client said">
        <div className="wrap">
          <Voice testimonial={testimonial} />
        </div>
      </section>

      <FinalCapture {...capture} firstName={firstName} setFirstName={setFirstName} errorMsg={errorMsg} />
    </div>
  );
}

function CaptureBar({ email, setEmail, status, downloadUrl, onSubmit }: CaptureState) {
  let action: ReactNode;
  if (status !== "success") {
    action = (
      <form onSubmit={onSubmit}>
        <input
          type="email"
          required
          aria-label="Your work email"
          placeholder="Your work email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn pri" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending" : "Get the blueprint"}
        </button>
      </form>
    );
  } else if (downloadUrl) {
    action = (
      <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="btn pri">
        Download your guide
      </a>
    );
  } else {
    action = <p className="sent">✓ Sent. Check your inbox.</p>;
  }
  return (
    <div className="mg-bar">
      <div className="wrap">
        <span className="pulse">Itqan Studio</span>
        {action}
      </div>
    </div>
  );
}

interface FinalCaptureProps extends CaptureState {
  firstName: string;
  setFirstName: (v: string) => void;
  errorMsg: string;
}

function FinalCapture({ email, setEmail, firstName, setFirstName, status, downloadUrl, errorMsg, onSubmit }: FinalCaptureProps) {
  return (
    <section className="cta" aria-labelledby="mg-get-title">
      <div className="wrap">
        <span className="sym">
          <Symbol gid="mg-cta-sym" />
        </span>
        <h2 id="mg-get-title">
          Get the <span className="g">blueprint.</span>
        </h2>
        <p className="lead">
          Drop your email and first name. The PDF lands within a minute, plus a five-day note series
          breaking down each section.
        </p>
        {status !== "success" ? (
          <form onSubmit={onSubmit}>
            <input
              type="text"
              required
              aria-label="First name"
              placeholder="First name"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="email"
              required
              aria-label="Work email"
              placeholder="Work email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn pri" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending" : "Send the blueprint"} <Arrow />
            </button>
            {status === "error" && (
              <p className="err" role="alert">
                {errorMsg}
              </p>
            )}
            <p className="small">No spam. Unsubscribe anytime.</p>
          </form>
        ) : (
          <div className="mg-sent" role="status" aria-live="polite">
            <b>✓ You&apos;re in.</b>
            {downloadUrl ? (
              <>
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="btn pri">
                  Download your guide
                </a>
                <p>We also emailed it to you.</p>
              </>
            ) : (
              <p>Check your inbox in the next couple of minutes.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Voice({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="mg-voice" data-reveal>
      <span className="mg-face">
        <Image src={testimonial.image ?? "/images/team/ibrahim-shareef.png"} alt={testimonial.name} fill sizes="72px" />
      </span>
      <div className="quote">
        <blockquote>&ldquo;{testimonial.quote}&rdquo;</blockquote>
        <figcaption>
          {testimonial.name}, {testimonial.company}
        </figcaption>
      </div>
    </figure>
  );
}

interface PanelProps {
  num: string;
  tag: string;
  title: string;
  items: readonly string[];
}

function Panel({ num, tag, title, items }: PanelProps) {
  return (
    <article>
      <p className="k">
        <b>{num}</b> {tag}
      </p>
      <h3>{title}</h3>
      <ul className="dots">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

// ─── Static per-brand defaults for the Inside + Audience panels ────────────
// Future: drive these per-magnet from Notion fields. For now these two panels
// carry the Itqan "what's in / who for" anchor across all magnets.

const INSIDE_PANEL_DEFAULTS = {
  title: "What the blueprint contains",
  items: [
    "The 7-section foundation document with prompts and examples",
    "The earned-secret exercise we run in every kickoff",
    "Positioning frameworks: one-liner, ICP, before-after-bridge",
    "The decision matrix: when to brand, when to wait, when to walk",
    "Two reference foundations: a recruitment platform and a health-tech app",
  ],
} as const;

const AUDIENCE_PANEL_DEFAULTS = {
  title: "Who this is for",
  items: [
    "GCC founders preparing a Series A raise",
    "Operators building a category-defining product in F&B, retail, fashion, or wellness",
    "Founders who refuse to start with a logo",
    "Anyone who's been burned by a freelance brand engagement that produced moodboards and nothing else",
    "The team that wants the strategist in the room, not the deck",
  ],
} as const;

// ─── Per-magnet featured project image system ──────────────────────────────
// Each Itqan magnet gets a different featured client mockup so the magnets
// don't all look like the same hero. Mapping is keyed off topic slug, with
// a fallback for unknown slugs.

interface FeaturedProject {
  src: string;
  alt: string;
  label: string;
}

const NEXILINK: FeaturedProject = {
  src: "/images/portfolio/nexilink/cover.png",
  alt: "Nexilink, recruitment platform foundation",
  label: "Nexilink (recruitment platform), anonymized",
};
const OUD_CLOSET: FeaturedProject = {
  src: "/images/portfolio/oud-closet/cover.png",
  alt: "Oud Closet, modest fashion foundation",
  label: "Oud Closet (modest fashion), anonymized",
};
const MEDACS: FeaturedProject = {
  src: "/images/portfolio/medacs/cover.png",
  alt: "Medacs, health-tech foundation",
  label: "Medacs (health-tech), anonymized",
};
const SHAREEFICO: FeaturedProject = {
  src: "/images/portfolio/shareefico/cover.png",
  alt: "Shareefico Studio, creator tooling foundation",
  label: "Shareefico Studio (creator tooling), anonymized",
};

const FEATURED_PROJECT_MAP: Record<string, FeaturedProject> = {
  "founder-os-diagnostic": NEXILINK,
  "weekly-company-revival-teardown": OUD_CLOSET,
  "soul-skeleton-heartbeat-diagnostic": MEDACS,
  "90-day-founder-os-stack": SHAREEFICO,
  // Legacy v1 topic slugs (Brand Foundation Sprint era): keep working until
  // the old magnets get regenerated under v2.1.
  "brand-foundation-roadmap": NEXILINK,
  "weekly-re-brand-teardown": OUD_CLOSET,
  "brand-vs-logo-diagnostic": MEDACS,
  "gcc-founders-brand-stack": SHAREEFICO,
};

function pickFeaturedProject(slug: string): FeaturedProject {
  return (
    FEATURED_PROJECT_MAP[slug] ?? {
      src: "/images/founder-render.png",
      alt: "Itqan studio reference",
      label: "Itqan reference foundation",
    }
  );
}

// ─── Per-slug testimonial rotation ─────────────────────────────────────────
// Deterministic pick so the same magnet always shows the same testimonial
// (no flicker between server and client renders). Hash-based selection across
// the real testimonials we have.

function pickTestimonial(slug: string): Testimonial {
  if (!testimonials.length) {
    return {
      quote: "[INSERT: real testimonial from Notion or LinkedIn]",
      name: "[INSERT: name]",
      company: "[INSERT: company]",
    };
  }
  const hash = slug.split("").reduce((acc, c) => (acc + c.charCodeAt(0)) | 0, 0);
  const idx = Math.abs(hash) % testimonials.length;
  return testimonials[idx];
}

// ─── Hero title accent ─────────────────────────────────────────────────────
// Convention: the magnet agent wraps ONE editorial word in single asterisks in
// the title (e.g. "The Founder OS *Diagnostic*: 10 Questions..."). That word
// renders in the v3 dusk gradient, the same highlight the rest of the site
// uses. Titles without asterisks render plain.
function renderTitleWithAccent(title: string): ReactNode {
  if (!title) return null;
  // Split on single-asterisk pairs (non-greedy, no nested asterisks).
  const parts = title.split(/(\*[^*\n]+\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2 && !part.startsWith("**")) {
      return (
        <span key={i} className="g">
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
