import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/feedback
 *
 * Client-testimonial form (feedback.itqanstudio.com → /feedback). Emails the
 * submission to Ibrahim over SES SMTP. The answers ARE the testimonial raw material, and his inbox is where every
 * other lead already lands, so v1 deliberately has no database.
 *
 * Body: { name, company?, role?, email?, rating, built, changed, quote,
 *         improve?, publishOk, project?, website? }
 * `website` is a honeypot: hidden field, humans never fill it. A filled value
 * returns a fake success and sends nothing.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SMTP_TIMEOUT_MS = 15_000;
/** Longest answer we accept — testimonials are paragraphs, not essays. */
const MAX_ANSWER = 2_000;
const MAX_SHORT = 150;

function str(value: unknown, max: number): string {
  // Strip C0/C1 control chars EXCEPT \n (U+000A) - answers are multi-line, but nothing
  // else control-shaped belongs in text that lands in an email body. Written as unicode
  // ESCAPES on purpose: literal control bytes in source are invisible and uneditable.
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g, "")
    .trim()
    .slice(0, max);
}

/** Single-line variant for fields that can reach the email SUBJECT — `str()` deliberately
 *  preserves newlines for multi-line answers, which a subject must never contain. */
function shortStr(value: unknown, max: number): string {
  return str(value, max).replace(/\n/g, " ").trim();
}

function line(label: string, value: string): string {
  return value ? `${label}: ${value}\n` : "";
}

/**
 * The client IP as established by OUR proxy, not by the client.
 *
 * Traefik (the only hop in front of this container) APPENDS the real peer address to any
 * X-Forwarded-For the client sent — so the FIRST value is attacker-writable and the LAST
 * value is the one our own edge observed. Keying the rate limiter on the first value would
 * hand out a fresh bucket per spoofed header, which on an endpoint that sends a real email
 * per request means unbounded sends and SES reputation damage. Deployment assumption
 * (single Traefik hop) is the same one the in-memory limiter itself already makes.
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

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  // One real email per submission → cap per-IP like the other public senders.
  const limit = rateLimit(`feedback:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  // Honeypot: pretend success, send nothing.
  if (str(payload.website, MAX_SHORT)) {
    return NextResponse.json({ ok: true });
  }

  const name = shortStr(payload.name, MAX_SHORT);
  const company = shortStr(payload.company, MAX_SHORT);
  const role = shortStr(payload.role, MAX_SHORT);
  const email = shortStr(payload.email, MAX_SHORT);
  const built = str(payload.built, MAX_ANSWER);
  const changed = str(payload.changed, MAX_ANSWER);
  const quote = str(payload.quote, MAX_ANSWER);
  const improve = str(payload.improve, MAX_ANSWER);
  const project = shortStr(payload.project, MAX_SHORT);
  const publishOk = payload.publishOk === true;
  const rating = Number(payload.rating);

  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ ok: false, error: "Rating 1-5 required" }, { status: 400 });
  }
  // The one answer the form exists to collect.
  if (!quote) {
    return NextResponse.json(
      { ok: false, error: "The recommendation answer is required" },
      { status: 400 }
    );
  }

  const smtpHost = process.env.SES_SMTP_HOST;
  const smtpPort = process.env.SES_SMTP_PORT;
  const smtpUser = process.env.SES_SMTP_USERNAME;
  const smtpPass = process.env.SES_SMTP_PASSWORD;
  // Feedback goes to the STUDIO address (Ibrahim: client feedback must not land in the
  // private Gmail). Own env with a contact fallback, so this route can point somewhere
  // different from the contact form without forking the rest of the mail config.
  const toEmail = process.env.FEEDBACK_TO_EMAIL || process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !toEmail || !fromEmail) {
    console.error("[feedback] SES SMTP / contact envs not fully set");
    return NextResponse.json(
      { ok: false, error: "Form not configured" },
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

  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const bodyText =
    line("Project", project) +
    line("Name", name) +
    line("Company", company) +
    line("Role", role) +
    line("Email", email) +
    `Rating: ${stars} (${rating}/5)\n` +
    `May publish with name: ${publishOk ? "YES" : "no — internal only"}\n` +
    (built ? `\nWhat we built together:\n${built}\n` : "") +
    (changed ? `\nWhat changed for them:\n${changed}\n` : "") +
    `\nTheir words (the testimonial):\n${quote}\n` +
    (improve ? `\nWhat we should do better:\n${improve}\n` : "");

  // HTML version — the quote is the artifact Ibrahim will copy into a case study, so it
  // leads, big and quoted; logistics follow. All user values escaped: this is guest input
  // rendered into markup.
  const esc = (v: string) =>
    v
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/\n/g, "<br>");
  const metaRow = (label: string, value: string) =>
    value
      ? `<tr><td style="padding:4px 14px 4px 0;color:#8a8577;font-size:13px;white-space:nowrap">${label}</td><td style="padding:4px 0;color:#1a1a1a;font-size:13px">${esc(value)}</td></tr>`
      : "";
  const section = (title: string, value: string) =>
    value
      ? `<p style="margin:18px 0 4px;color:#8a8577;font-size:12px;letter-spacing:.08em;text-transform:uppercase">${title}</p>
         <p style="margin:0;color:#1a1a1a;font-size:14px;line-height:1.6">${esc(value)}</p>`
      : "";
  const bodyHtml = `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:28px 22px">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#8a8577">Itqan Studio — client feedback</p>
    <p style="margin:0 0 18px;font-size:22px;color:#c9a227">${stars} <span style="color:#8a8577;font-size:14px">(${rating}/5)</span></p>
    <div style="background:#fff;border-radius:14px;padding:22px 24px;border:1px solid rgba(0,0,0,.07)">
      <p style="margin:0;font-size:17px;line-height:1.65;color:#1a1a1a">&ldquo;${esc(quote)}&rdquo;</p>
      <p style="margin:14px 0 0;font-size:13px;color:#8a8577">— ${esc(name)}${company ? `, ${esc(company)}` : ""}</p>
    </div>
    <p style="margin:14px 0 0;font-size:13px;font-weight:bold;color:${publishOk ? "#1c7a43" : "#a05a00"}">
      ${publishOk ? "✔ May be published with their name" : "✱ Private — do NOT publish"}
    </p>
    ${section("What we built together", built)}
    ${section("What changed for them", changed)}
    ${section("What we should do better", improve)}
    <table style="margin-top:22px;border-top:1px solid rgba(0,0,0,.08);padding-top:8px;border-collapse:collapse">
      ${metaRow("Project", project)}${metaRow("Role", role)}${metaRow("Email", email)}
    </table>
    <p style="margin:26px 0 0;font-size:11px;color:#b3ada0">Sent from feedback.itqanstudio.com</p>
  </div></body></html>`;

  try {
    await transporter.sendMail({
      from: `Itqan Studio <${fromEmail}>`,
      to: toEmail,
      ...(email ? { replyTo: email } : {}),
      subject: `[feedback] ${stars} ${name}${project ? ` · ${project}` : ""}`,
      text: bodyText,
      html: bodyHtml,
    });
  } catch (err) {
    console.error("[feedback] send failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not send right now. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
