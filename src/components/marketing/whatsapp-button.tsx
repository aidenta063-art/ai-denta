import { getTranslations } from "next-intl/server";
import { RiWhatsappFill } from "react-icons/ri";
import { WHATSAPP_NUMBER } from "@/lib/payment";

/** Floating action button mirroring the FAQ chat bubble's size/position
 * (see faq-chat-widget.tsx), stacked directly above it. Sits at a lower
 * z-index than the chat widget (z-30) so the chat panel opens in front
 * of it instead of this button floating on top of the panel. */
export async function WhatsAppButton() {
  const t = await getTranslations("WhatsAppButton");

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("label")}
      className="fixed bottom-24 start-6 z-20 flex size-14 items-center justify-center rounded-full bg-[#7E00C9] text-white shadow-xl transition-transform hover:scale-105"
    >
      <RiWhatsappFill className="size-7" />
    </a>
  );
}
