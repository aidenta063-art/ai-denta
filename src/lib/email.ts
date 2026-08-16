import { Resend } from "resend";
import { logger } from "@/lib/logger";

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

const EMAIL_FROM = "Ai Denta <notifications@ai-denta.com>";

/**
 * Sends via Resend when RESEND_API_KEY is configured; otherwise falls back
 * to logging the email to the server console (e.g. local dev without the
 * key set). The body is only logged outside production — it can carry
 * sensitive content (e.g. password-reset links/tokens), and production
 * server logs are readable by anyone with Vercel project access, a wider
 * audience than the token is meant for. Production logs recipient/subject
 * only in the no-provider fallback case.
 */
export async function sendEmail({ to, subject, text }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      logger.info(
        { to, subject },
        "Email would be sent (no email provider configured — body withheld)",
      );
      return;
    }
    logger.info(
      { to, subject, text },
      "Email would be sent (dev console transport)",
    );
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    text,
  });

  if (error) {
    logger.error({ err: error, to, subject }, "Failed to send email via Resend");
  }
}
