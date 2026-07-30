import { product } from "./product.ts";
import { log } from "./observability.ts";

/**
 * Transactional email.
 *
 * Resend over plain fetch — one POST, no SDK. If RESEND_API_KEY is unset we log
 * the message instead of sending it. That is deliberate: a password reset flow
 * that *silently* does nothing without an email provider is the worst outcome,
 * and blocking signup until you own a verified domain is the second worst. With
 * this, a fresh deployment works end to end and the reset link is recoverable
 * from the logs until you add the key.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function fromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || `${product.name} <onboarding@resend.dev>`;
}

export type SendResult = { ok: boolean; id?: string; error?: string; delivered: boolean };

export async function sendEmail(to: string, subject: string, html: string, text: string): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY?.trim();

  if (!key) {
    log("warn", "email", "RESEND_API_KEY unset — email not sent, contents logged instead", {
      to,
      subject,
      text,
    });
    return { ok: true, delivered: false };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromAddress(), to: [to], subject, html, text }),
      signal: AbortSignal.timeout(8000),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      log("error", "email", "Resend rejected the message", { status: res.status, message: body.message });
      return { ok: false, error: body.message ?? `Resend returned ${res.status}`, delivered: false };
    }
    log("info", "email", "sent", { to, subject, id: body.id });
    return { ok: true, id: body.id, delivered: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    log("error", "email", "Resend request failed", { message });
    return { ok: false, error: message, delivered: false };
  }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function shell(heading: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:520px;background:#fff;border-radius:14px;padding:32px;border:1px solid #e6e8eb">
      <tr><td>
        <div style="font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${product.accent}">${product.name}</div>
        <h1 style="font-size:22px;margin:12px 0 16px;color:#111827">${heading}</h1>
        ${bodyHtml}
        <hr style="border:none;border-top:1px solid #eceef1;margin:28px 0 16px"/>
        <p style="font-size:12px;color:#6b7280;margin:0">${product.name} by Abet Works &middot; <a href="https://abetworks.in" style="color:#6b7280">abetworks.in</a></p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:0 0 20px"><a href="${href}" style="display:inline-block;background:${product.accent};color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px">${label}</a></p>`;
}

export function sendWelcome(to: string, name: string | null, origin: string): Promise<SendResult> {
  const who = name?.split(" ")[0] ?? "there";
  return sendEmail(
    to,
    `Welcome to ${product.name}`,
    shell(
      `Hi ${who}, your account is ready`,
      `<p style="font-size:15px;line-height:1.6;color:#374151;margin:0 0 20px">${product.oneLiner}</p>
       ${button(`${origin}/dashboard`, "Open your dashboard")}
       <p style="font-size:14px;line-height:1.6;color:#6b7280;margin:0">Your free plan is active right away. Your dashboard shows your usage for the month and is where you create API keys once you upgrade.</p>`,
    ),
    `Hi ${who}, your ${product.name} account is ready.\n\n${product.oneLiner}\n\nDashboard: ${origin}/dashboard\n`,
  );
}

export function sendPasswordReset(to: string, token: string, origin: string): Promise<SendResult> {
  const link = `${origin}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail(
    to,
    `Reset your ${product.name} password`,
    shell(
      "Reset your password",
      `<p style="font-size:15px;line-height:1.6;color:#374151;margin:0 0 20px">Use the link below to choose a new password. It expires in one hour and can only be used once.</p>
       ${button(link, "Choose a new password")}
       <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:0">If you did not ask for this, you can ignore this email — nothing has changed on your account.</p>`,
    ),
    `Reset your ${product.name} password:\n\n${link}\n\nThis link expires in one hour and can be used once. If you did not request it, ignore this email.\n`,
  );
}

export function sendPaymentFailed(to: string, origin: string): Promise<SendResult> {
  return sendEmail(
    to,
    `Action needed: payment failed for ${product.name}`,
    shell(
      "Your last payment did not go through",
      `<p style="font-size:15px;line-height:1.6;color:#374151;margin:0 0 20px">We could not charge your payment method, so API access is paused until it is updated. Nothing has been deleted.</p>
       ${button(`${origin}/dashboard`, "Update payment method")}`,
    ),
    `We could not charge your payment method for ${product.name}. Access is paused until it is updated: ${origin}/dashboard\n`,
  );
}
