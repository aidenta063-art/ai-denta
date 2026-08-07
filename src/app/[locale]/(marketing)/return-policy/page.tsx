import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "ar" ? "سياسة الاسترجاع والاستبدال" : "Return & Refund Policy",
  };
}

const CONTENT = {
  en: {
    title: "Return & Refund Policy",
    updated: "Last updated: August 2026",
    intro:
      "Ai Denta sells paid consultation sessions, not physical goods, so this policy covers cancellations and refunds for those bookings rather than product returns or exchanges.",
    sections: [
      {
        heading: "Refund eligibility",
        body: "You're entitled to a full refund if you cancel your paid consultation before it takes place. Reach out to us with your booking details and we'll process the refund back to your original payment method.",
      },
      {
        heading: "Rescheduling",
        body: "Prefer a different time instead of a refund? Contact us and we'll move your session to another available slot at no extra cost.",
      },
      {
        heading: "After the session",
        body: "Once a consultation has been delivered, it's considered a completed service and is no longer eligible for a refund, since the time and expertise have already been provided.",
      },
      {
        heading: "Processing time",
        body: "Approved refunds are processed within 7–14 business days, depending on your bank or payment provider.",
      },
      {
        heading: "How to request a refund or reschedule",
        body: "Email Support@ai-denta.com or call 01097308908 with your name and booking details, and we'll take care of it.",
      },
    ],
  },
  ar: {
    title: "سياسة الاسترجاع والاستبدال",
    updated: "آخر تحديث: أغسطس 2026",
    intro:
      "خدمات Ai Denta هي جلسات استشارة مدفوعة، مش منتجات ملموسة، فالسياسة دي بتوضح شروط الإلغاء والاسترجاع للحجوزات، مش استرجاع أو استبدال منتج.",
    sections: [
      {
        heading: "شروط الاسترجاع",
        body: "لو لغيت الاستشارة المدفوعة قبل ميعادها، بترجعلك فلوسك كاملة. تواصل معانا وابعتلنا تفاصيل الحجز وهنرجعلك المبلغ بنفس وسيلة الدفع اللي استخدمتها.",
      },
      {
        heading: "تغيير الميعاد",
        body: "لو عايز تأجل الاستشارة بدل ما تسترجع فلوسك، تواصل معانا وهنظبطلك ميعاد تاني متاح من غير أي تكلفة إضافية.",
      },
      {
        heading: "بعد الجلسة",
        body: "بمجرد ما الاستشارة تتقدم، بتتحسب خدمة اتنفذت بالكامل ومبقاش ينفع نرجع فلوسها، لأن الوقت والخبرة اتقدموا فعلاً.",
      },
      {
        heading: "مدة الاسترجاع",
        body: "المبالغ المستردة بتتحول خلال 7 إلى 14 يوم عمل، على حسب بنكك أو وسيلة الدفع.",
      },
      {
        heading: "إزاي تطلب استرجاع أو تغيير ميعاد",
        body: "ابعتلنا إيميل على Support@ai-denta.com أو اتصل بينا على 01097308908 وقولنا اسمك وتفاصيل حجزك وهنتصرف.",
      },
    ],
  },
} as const;

export default async function ReturnPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = locale === "ar" ? CONTENT.ar : CONTENT.en;

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
      <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t.updated}</p>
      <p className="mt-6 text-muted-foreground">{t.intro}</p>

      <div className="mt-10 flex flex-col gap-8">
        {t.sections.map((section) => (
          <div key={section.heading} className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {section.heading}
            </h2>
            <p className="text-muted-foreground">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
