export interface FaqQuestionConfig {
  qEn: string;
  aEn: string;
  qAr: string;
  aAr: string;
}

/** Used when no admin-saved config exists yet (fresh install) — mirrors
 * the widget's original hardcoded copy so it doesn't change on first
 * deploy. Admins can edit everything from here onward via Dashboard >
 * Content > FAQ Chat Widget. */
export const DEFAULT_FAQ_QUESTIONS: FaqQuestionConfig[] = [
  {
    qEn: "How much does it cost?",
    aEn: "It depends on what your clinic needs. Our basic packages start at $300 and $500.",
    qAr: "بيتكلف قد ايه؟",
    aAr: "بيعتمد على احتياجات عيادتك. باقاتنا الأساسية بتبدأ من 300 و500 دولار.",
  },
  {
    qEn: "Why book a Premium Ticket?",
    aEn: "You get priority booking, 30% extra content in your first month, a customized plan for your clinic, and a free e-book on Patient Experience.",
    qAr: "ليه أحجز تذكرة بريميوم؟",
    aAr: "هتاخد أولوية في الحجز، ومحتوى إضافي بنسبة 30% في أول شهر، وخطة مخصصة لعيادتك، وكمان كتاب إلكتروني مجاني عن تجربة المريض.",
  },
  {
    qEn: "When will I see results?",
    aEn: "Real marketing takes time, not magic. With our system, you'll see real new patients in 4 months.",
    qAr: "هشوف نتايج امتى؟",
    aAr: "التسويق الحقيقي محتاج وقت مش سحر. مع نظامنا، هتشوف مرضى جداد حقيقيين خلال 4 شهور.",
  },
  {
    qEn: "Why choose us?",
    aEn: "We're dentists just like you, 100% specialized in dental clinics. So, the real question is: why wouldn't you choose us?",
    qAr: "ليه تختارونا؟",
    aAr: "إحنا أطباء أسنان زيك بالظبط، متخصصين 100% في عيادات الأسنان. يبقى السؤال الحقيقي: ليه متختاروناش؟",
  },
];
