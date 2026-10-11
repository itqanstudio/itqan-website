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
/** The two capture forms on the page: the sticky bar and the final section. */
type CaptureSource = "bar" | "final";

interface CaptureState {
  email: string;
  setEmail: (v: string) => void;
  status: Status;
  downloadUrl: string | null;
  onSubmit: (e: FormEvent) => void;
  /**
   * Shown only in the form that was used (see errorSource), so a failed submit
   * from the sticky bar is never silent and is announced once, not twice.
   */
  errorMsg: string;
  errorSource: CaptureSource | null;
}

export function MagnetLanding({ magnet }: { magnet: LeadMagnet }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorSource, setErrorSource] = useState<CaptureSource | null>(null);
  // PDF URL confirmed by the capture API on success, used for the instant
  // on-page download button. Falls back to the magnet's own pdfUrl.
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const featuredProject = useMemo(() => pickFeaturedProject(magnet.topicSlug), [magnet.topicSlug]);
  const testimonial = useMemo(() => pickTestimonial(magnet.topicSlug), [magnet.topicSlug]);

  async function handleSubmit(e: FormEvent, source: CaptureSource) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    setErrorSource(source);
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

  const capture = { email, setEmail, status, downloadUrl, errorMsg, errorSource };
  const submitFrom = (source: CaptureSource) => (e: FormEvent) => void handleSubmit(e, source);

  return (
    <div className="mg">
      <CaptureBar {...capture} onSubmit={submitFrom("bar")} />

      <section className="mg-hero" aria-labelledby="mg-title">
        <div className="wrap">
          <p className="k">
            <b>■</b> Itqan · Free guide
          </p>
          <h1 id="mg-title">{renderTitleWithAccent(magnet.title)}</h1>
          <p className="lead">
            {magnet.landingTeaser || "A short guide from Itqan, sent to your inbox as a PDF."}
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
              <b>■</b> Who it is for
            </p>
            <h2 id="mg-inside-title">
              Written for the people who <span className="g">run the operation.</span>
            </h2>
          </div>
          <div className="mg-panels" data-reveal>
            <Panel num="01" tag="Audience" {...AUDIENCE_PANEL_DEFAULTS} />
          </div>
        </div>
      </section>

      <section className="s" aria-labelledby="mg-feat-title">
        <div className="wrap mg-feat">
          <div className="txt" data-reveal>
            <p className="k">
              <b>■</b> Work
            </p>
            <h2 id="mg-feat-title">
              Built by the team <span className="g">behind this guide.</span>
            </h2>
            <p>{featuredProject.body}</p>
            <p className="lab">
              <a href={featuredProject.href}>Read the {featuredProject.label} case</a>
            </p>
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

      <FinalCapture {...capture} onSubmit={submitFrom("final")} firstName={firstName} setFirstName={setFirstName} />
    </div>
  );
}

function CaptureBar({ email, setEmail, status, downloadUrl, onSubmit, errorMsg, errorSource }: CaptureState) {
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
          {status === "submitting" ? "Sending" : "Get the guide"}
        </button>
        {status === "error" && errorSource === "bar" && errorMsg && (
          <p className="mg-bar-err" role="alert">
            {errorMsg}
          </p>
        )}
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
        <span className="pulse">Itqan</span>
        {action}
      </div>
    </div>
  );
}

interface FinalCaptureProps extends CaptureState {
  firstName: string;
  setFirstName: (v: string) => void;
}

function FinalCapture({ email, setEmail, firstName, setFirstName, status, downloadUrl, errorMsg, errorSource, onSubmit }: FinalCaptureProps) {
  return (
    <section className="cta" aria-labelledby="mg-get-title">
      <div className="wrap">
        <span className="sym">
          <Symbol gid="mg-cta-sym" />
        </span>
        <h2 id="mg-get-title">
          Get the <span className="g">guide.</span>
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
              {status === "submitting" ? "Sending" : "Send me the guide"} <Arrow />
            </button>
            {status === "error" && errorSource === "final" && (
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

// ─── Static Audience panel ─────────────────────────────────────────────────
// Brand v3 (11 Oct 2026): the buyers Itqan writes for. The old "what the
// blueprint contains" panel described the retired brand-foundation offer and
// is gone; a guide's own content comes from its Notion teaser.

const AUDIENCE_PANEL_DEFAULTS = {
  title: "Who this is for",
  items: [
    "Operations, supply chain and IT leaders in manufacturing",
    "Store operations and customer service leaders in retail",
    "Owners and operators of food and beverage groups",
    "Teams whose work lives in a shared inbox and one person's head",
  ],
} as const;

// ─── Featured work ─────────────────────────────────────────────────────────
// The two products the site features (src/content/v3/en.ts), alternated by
// slug so neighbouring guides do not show the same picture.

interface FeaturedProject {
  src: string;
  alt: string;
  label: string;
  href: string;
  body: string;
}

const MILLOW: FeaturedProject = {
  src: "/v3/img/millow-cover.jpg",
  alt: "The Millow website: oat-protein meatballs under a spotlight",
  label: "Millow",
  href: "/work/millow",
  body: "Millow ferments Swedish oats and mycelium into protein. We are the design partner on their two-language website: 56 tracked design rounds, and 113 browser tests behind every weekly release.",
};
const NEXILINK: FeaturedProject = {
  src: "/v3/img/nexilink-cover.jpg",
  alt: "A hand holding a printed Nexilink brochure",
  label: "Nexilink",
  href: "/work/nexilink",
  body: "Nexilink gives Swedish municipalities onboarding and training software for new staff. We helped build it: brand, research and product design in three weeks, and first place at the 2024 investor competition.",
};

function pickFeaturedProject(slug: string): FeaturedProject {
  const hash = slug.split("").reduce((acc, c) => (acc + c.charCodeAt(0)) | 0, 0);
  return Math.abs(hash) % 2 === 0 ? MILLOW : NEXILINK;
}

// ─── Per-slug testimonial rotation ─────────────────────────────────────────
// Deterministic pick so the same magnet always shows the same testimonial
// (no flicker between server and client renders). Hash-based selection across
// the real testimonials we have.

function pickTestimonial(slug: string): Testimonial {
  // A real, published quote (the site's Nexilink case), never a placeholder that could ship.
  if (!testimonials.length) {
    return {
      quote: "Itqan is a partner we trust for both speed and quality.",
      name: "Abdi Mohamud",
      company: "Nexilink",
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
