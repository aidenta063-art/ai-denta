"use server";

import { updateTag, revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import { faqChatConfigInputSchema } from "@/lib/validation/faq-chat-config.schema";
import {
  saveFaqQuestions,
  FAQ_CHAT_CACHE_TAG,
} from "@/services/content/faq-chat.service";

export type FaqChatBuilderState = { error?: boolean; success?: boolean };

export async function saveFaqQuestionsAction(
  locale: Locale,
  _prevState: FaqChatBuilderState,
  formData: FormData,
): Promise<FaqChatBuilderState> {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);

  const raw = formData.get("questionsJson");
  if (typeof raw !== "string") return { error: true };

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return { error: true };
  }

  const parsed = faqChatConfigInputSchema.safeParse(parsedJson);
  if (!parsed.success) return { error: true };

  await saveFaqQuestions(parsed.data, session.user.id);

  updateTag(FAQ_CHAT_CACHE_TAG);
  revalidatePath(`/${locale}/dashboard/content/faq-chat`);

  return { success: true };
}
