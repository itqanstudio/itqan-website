import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/contact
 *
 * Contact page inquiry form (ContactForm.tsx). Sends the message over
 * Amazon SES SMTP via nodemailer straight to Ibrahim's inbox — replaces the
 * earlier Formspree submission (Kit/Formspree removal pass).
 *
 * Body: { name, email, company?, website?, budget?, phone?, message, intent?, referralCode? }
 *
 * This endpoint is public, unauthenticated, and sends a real email per call, so
 * it carries the same three protections as /api/feedback: a per-IP rate limit, a
 * honeypot, and hard length caps. Without them a script can burn the SES quota
 * and the itqanstudio.com sending reputation (security review, 16 Sep 2026).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SMTP_TIMEOUT_MS = 15_000;

/** Caps chosen to match /api/feedback. Long enough for a real enquiry. */
const MAX_SHORT = 200;
const MAX_MESSAGE = 5_000;

/** Per-IP window. One real email per submission. */
const RATE_MAX = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  website?: unknown;
  budget?: unknown;
  phone?: unknown;
  message?: unknown;
  intent?: unknown;
  /** Honeypot. Hidden from humans, so any value means a bot filled it. */
  referralCode?: unknown;
}

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * For anything that ends up in a mail header. nodemailer strips CR and LF from
 * header values itself, but relying on a library default for header-injection
 * safety is not the same as handling it, and this value reaches the Subject.
 */
function headerStr(value: unknown, max: number): string {
  return str(value, max).replace(/[\r\n]+/g, " ");
}

/**
 * Trust only the LAST hop in x-forwarded-for. Earlier entries are attacker
 * supplied, and taking one of those would hand out a fresh bucket per spoofed
 * header, which defeats the limit on an endpoint that sends a real email per
 * request. Deployment assumption (single Traefik hop) matches the limiter's own.
 */
function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    const last = parts[parts.length - 1]?.trim();
    if (last) return last;
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Format a labeled line for the plain-text email body, omitting empty values. */
function line(label: string, value: string): string {
  return value ? `${label}: ${value}\n` : "";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limit = rateLimit(`contact:${ip}`, RATE_MAX, RATE_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let payload: ContactPayload;
  try {
    payload = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Honeypot: report success, send nothing. A bot gets no signal it was caught.
  if (str(payload.referralCode, MAX_SHORT)) {
    return NextResponse.json({ ok: true });
  }

  const name = headerStr(payload.name, MAX_SHORT);
  const email = headerStr(payload.email, MAX_SHORT);
  const company = str(payload.company, MAX_SHORT);
  const website = str(payload.website, MAX_SHORT);
  const budget = str(payload.budget, MAX_SHORT);
  const phone = str(payload.phone, MAX_SHORT);
  const message = str(payload.message, MAX_MESSAGE);
  const intent = str(payload.intent, MAX_SHORT);

  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Name is required" },
      { status: 400 }
    );
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Valid email required" },
      { status: 400 }
    );
  }
  if (!message) {
    return NextResponse.json(
      { ok: false, error: "Message is required" },
      { status: 400 }
    );
  }

  const smtpHost = process.env.SES_SMTP_HOST;
  const smtpPort = process.env.SES_SMTP_PORT;
  const smtpUser = process.env.SES_SMTP_USERNAME;
  const smtpPass = process.env.SES_SMTP_PASSWORD;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !toEmail || !fromEmail) {
    console.error("[contact] SES SMTP / contact envs not fully set");
    return NextResponse.json(
      { ok: false, error: "Contact form not configured" },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: Number(smtpPort) === 465,
    auth: { user: smtpUser, pass: smtpPass },
    connectionTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
  });

  const bodyText =
    line("Name", name) +
    line("Email", email) +
    line("Company", company) +
    line("Website", website) +
    line("Budget", budget) +
    line("Phone", phone) +
    line("Intent", intent) +
    `\nMessage:\n${message}\n`;

  try {
    await transporter.sendMail({
      from: `Itqan Studio <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: `[itqanstudio.com] Inquiry from ${name}`,
      text: bodyText,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[contact] SES send failed:", msg);
    return NextResponse.json(
      { ok: false, error: "Message failed to send. Please try again." },
      { status: 502 }
    );
  }
}
