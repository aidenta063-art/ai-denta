import { unstable_cache as nextCache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_FAQ_QUESTIONS,
  type FaqQuestionConfig,
} from "@/lib/faq-chat-fields";

const CACHE_SECONDS = 60;
export const FAQ_CHAT_CACHE_TAG = "cms:faq-chat-questions";

export const getFaqQuestions = nextCache(
  async (): Promise<FaqQuestionConfig[]> => {
    const config = await prisma.faqChatConfig.findUnique({
      where: { id: "singleton" },
    });
    return (
      (config?.questions as unknown as FaqQuestionConfig[] | undefined) ??
      DEFAULT_FAQ_QUESTIONS
    );
  },
  ["cms-faq-chat-questions"],
  { tags: [FAQ_CHAT_CACHE_TAG], revalidate: CACHE_SECONDS },
);

export async function saveFaqQuestions(
  questions: FaqQuestionConfig[],
  updatedById: string,
) {
  await prisma.faqChatConfig.upsert({
    where: { id: "singleton" },
    update: { questions: questions as object, updatedById },
    create: { id: "singleton", questions: questions as object, updatedById },
  });
}
