import { logger } from "@/lib/logger";

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

/**
 * Local-dev transport: no SMTP/API key configured yet, so we log the email
 * to the server console instead of sending it. Swap this for a real
 * provider (e.g. Resend) behind the same signature when one is available.
 *
 * The body is only logged outside production — it can carry sensitive
 * content (e.g. password-reset links/tokens), and production server logs
 * are readable by anyone with Vercel project access, a wider audience than
 * the token is meant for. Production logs recipient/subject only, so
 * reset requests are still observable without leaking the credential.
 */
export async function sendEmail({ to, subject, text }: SendEmailInput) {
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
}
