import { z } from "zod";

export const faqQuestionInputSchema = z.object({
  qEn: z.string().trim().min(1).max(200),
  aEn: z.string().trim().min(1).max(1000),
  qAr: z.string().trim().min(1).max(200),
  aAr: z.string().trim().min(1).max(1000),
});

export const faqChatConfigInputSchema = z.array(faqQuestionInputSchema).min(1);

export type FaqQuestionInput = z.infer<typeof faqQuestionInputSchema>;
