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
 */
export async function sendEmail({ to, subject, text }: SendEmailInput) {
  logger.info(
    { to, subject, text },
    "Email would be sent (dev console transport)",
  );
}
