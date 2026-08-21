import nodemailer from "nodemailer";
import { captureServerError } from "./posthog";

export function mailConfigured(): boolean {
  const hasGmail = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  return Boolean((hasGmail || hasResend) && process.env.NOTIFY_EMAIL);
}

function gmailTransport() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

async function sendViaGmail(params: {
  subject: string;
  text: string;
}): Promise<boolean> {
  const transport = gmailTransport();
  const to = process.env.NOTIFY_EMAIL;
  const user = process.env.EMAIL_USER;
  if (!transport || !to || !user) return false;

  try {
    await transport.sendMail({
      from: process.env.MAIL_FROM ?? `Huesca Hoy <${user}>`,
      to,
      subject: params.subject,
      text: params.text,
    });
    return true;
  } catch (err) {
    await captureServerError("email_error", {
      provider: "gmail",
      error: err instanceof Error ? err.message : String(err),
      subject: params.subject,
    });
    return false;
  }
}

async function sendViaResend(params: {
  subject: string;
  text: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM ?? "Huesca Hoy <onboarding@resend.dev>",
        to: [to],
        subject: params.subject,
        text: params.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      await captureServerError("email_error", {
        provider: "resend",
        status: res.status,
        body: body.slice(0, 300),
        subject: params.subject,
      });
      return false;
    }
    return true;
  } catch (err) {
    await captureServerError("email_error", {
      provider: "resend",
      error: err instanceof Error ? err.message : String(err),
      subject: params.subject,
    });
    return false;
  }
}

export async function sendNotificationEmail(params: {
  subject: string;
  text: string;
}): Promise<boolean> {
  if (!mailConfigured()) return false;
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return sendViaGmail(params);
  }
  return sendViaResend(params);
}
