import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import { getFaqQuestions } from "@/services/content/faq-chat.service";
import { FaqChatBuilder } from "@/components/dashboard/faq-chat-builder";

export default async function FaqChatContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const questions = await getFaqQuestions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          FAQ Chat Widget
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The quick questions and answers shown in the chat bubble on every
          public page.
        </p>
      </div>

      <FaqChatBuilder locale={locale} initialQuestions={questions} />
    </div>
  );
}
