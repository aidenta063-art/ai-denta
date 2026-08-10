import { logger } from "@/lib/logger";
import { APP_TIME_ZONE } from "@/lib/timezone";

const GRAPH_API_VERSION = "v21.0";

export class WhatsAppSendError extends Error {}

/** WhatsApp Cloud API `to` needs digits only, country code first, no
 * leading zero or "+" — Egyptian numbers are stored as either local
 * (01xxxxxxxxx) or already-international, so normalize both. */
export function toWhatsAppPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return `20${digits.slice(1)}`;
  return digits;
}

export function formatWhatsAppDate(date: Date, locale: "ar" | "en" = "ar") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    timeZone: APP_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatWhatsAppTime(date: Date, locale: "ar" | "en" = "ar") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    timeZone: APP_TIME_ZONE,
    timeStyle: "short",
  }).format(date);
}

/** Sends an approved WhatsApp message template. Templates are required for
 * any business-initiated message (booking confirmations, reminders) sent
 * outside the 24h customer-service window — free-form text isn't allowed
 * there, so this only ever sends templates, never raw text. */
export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode = "ar",
  bodyParams = [],
}: {
  to: string;
  templateName: string;
  languageCode?: string;
  bodyParams?: string[];
}) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!accessToken || !phoneNumberId) {
    throw new WhatsAppSendError("WhatsApp API credentials are not configured");
  }

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toWhatsAppPhone(to),
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          ...(bodyParams.length > 0 && {
            components: [
              {
                type: "body",
                parameters: bodyParams.map((text) => ({ type: "text", text })),
              },
            ],
          }),
        },
      }),
    },
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new WhatsAppSendError(
      data?.error?.message ?? `WhatsApp API request failed (${response.status})`,
    );
  }
  return data;
}

/** Best-effort send — logs and swallows failures instead of throwing, so a
 * WhatsApp/Meta outage never blocks the booking flow or cron run that
 * triggered it. */
export async function sendWhatsAppTemplateSafe(
  args: Parameters<typeof sendWhatsAppTemplate>[0],
) {
  try {
    await sendWhatsAppTemplate(args);
    return true;
  } catch (error) {
    logger.error(
      { err: error, to: args.to, template: args.templateName },
      "Failed to send WhatsApp template message",
    );
    return false;
  }
}
