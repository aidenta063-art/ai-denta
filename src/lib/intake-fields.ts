export type IntakeFieldType =
  "text" | "tel" | "email" | "select" | "radio" | "textarea";

export interface IntakeOptionConfig {
  value: string;
  labelEn: string;
  labelAr: string;
}

export interface IntakeFieldConfig {
  key: string;
  type: IntakeFieldType;
  required: boolean;
  labelEn: string;
  labelAr: string;
  placeholderEn?: string;
  placeholderAr?: string;
  options?: IntakeOptionConfig[];
}

export interface IntakeStepConfig {
  titleEn: string;
  titleAr: string;
  fields: IntakeFieldConfig[];
}

/** Used when no admin-saved config exists yet (fresh install) — mirrors
 * the form's original hardcoded copy so the public form doesn't change
 * on first deploy. Admins can edit everything from here onward via
 * Dashboard > Content > Booking Form Questions. */
export const DEFAULT_INTAKE_STEPS: IntakeStepConfig[] = [
  {
    titleEn: "Let's Get to Know You",
    titleAr: "خلينا نتعرف عليك",
    fields: [
      {
        key: "role",
        type: "select",
        required: true,
        labelEn: "Your Role",
        labelAr: "دورك",
        options: [
          {
            value: "CLINIC_OWNER",
            labelEn: "Clinic Owner",
            labelAr: "مالك العيادة",
          },
          {
            value: "CLINIC_MANAGER",
            labelEn: "Clinic Manager",
            labelAr: "مدير العيادة",
          },
          { value: "TEAM_MEMBER", labelEn: "Team Member", labelAr: "عضو فريق" },
        ],
      },
    ],
  },
  {
    titleEn: "Clinic Overview",
    titleAr: "نظرة عامة على العيادة",
    fields: [
      {
        key: "clinicLocation",
        type: "text",
        required: true,
        labelEn: "Clinic Location (City/Area)",
        labelAr: "موقع العيادة (المدينة/المنطقة)",
        placeholderEn: "Enter clinic location (City/Area)",
        placeholderAr: "ادخل موقع العيادة (المدينة/المنطقة)",
      },
      {
        key: "yearsInOperation",
        type: "select",
        required: true,
        labelEn: "Years in Operation",
        labelAr: "سنوات التشغيل",
        options: [
          {
            value: "LESS_THAN_1",
            labelEn: "Less than 1 year",
            labelAr: "أقل من سنة",
          },
          { value: "ONE_TO_THREE", labelEn: "1–3 years", labelAr: "1-3 سنوات" },
          {
            value: "THREE_TO_FIVE",
            labelEn: "3–5 years",
            labelAr: "3-5 سنوات",
          },
          {
            value: "FIVE_PLUS",
            labelEn: "5+ years",
            labelAr: "أكتر من 5 سنوات",
          },
        ],
      },
      {
        key: "teamSize",
        type: "select",
        required: true,
        labelEn: "Total Team Size (Doctors & Staff)",
        labelAr: "حجم الفريق الكلي (دكاترة وموظفين)",
        options: [
          { value: "ONE_TO_TWO", labelEn: "1–2", labelAr: "1-2" },
          { value: "THREE_TO_FIVE", labelEn: "3–5", labelAr: "3-5" },
          { value: "SIX_TO_TEN", labelEn: "6–10", labelAr: "6-10" },
          { value: "TEN_PLUS", labelEn: "10+", labelAr: "أكتر من 10" },
        ],
      },
      {
        key: "weeklyPatients",
        type: "select",
        required: true,
        labelEn: "Average Weekly Patients",
        labelAr: "متوسط عدد المرضى أسبوعيًا",
        options: [
          { value: "BELOW_20", labelEn: "Below 20", labelAr: "أقل من 20" },
          { value: "TWENTY_TO_FIFTY", labelEn: "20-50", labelAr: "20-50" },
          { value: "ABOVE_FIFTY", labelEn: "Above 50", labelAr: "أكتر من 50" },
        ],
      },
    ],
  },
  {
    titleEn: "Growth & Revenue Goals",
    titleAr: "أهداف النمو والإيرادات",
    fields: [
      {
        key: "targetPatientClass",
        type: "select",
        required: true,
        labelEn: "Target Patient Class",
        labelAr: "فئة المرضى المستهدفة",
        options: [
          { value: "CLASS_A", labelEn: "Class A", labelAr: "فئة A" },
          { value: "CLASS_B", labelEn: "Class B", labelAr: "فئة B" },
          { value: "CLASS_C", labelEn: "Class C", labelAr: "فئة C" },
        ],
      },
      {
        key: "focusService",
        type: "text",
        required: true,
        labelEn: "The Service You Want to Focus On",
        labelAr: "الخدمة اللي عايز تركز عليها",
        placeholderEn: "Enter The Service You Want to Focus On",
        placeholderAr: "ادخل الخدمة اللي عايز تركز عليها",
      },
      {
        key: "focusServicePrice",
        type: "text",
        required: true,
        labelEn: "Average Price of This Service",
        labelAr: "متوسط سعر الخدمة دي",
        placeholderEn: "Enter The Average Price of This Service",
        placeholderAr: "ادخل متوسط سعر الخدمة دي",
      },
      {
        key: "marketingBudget",
        type: "select",
        required: true,
        labelEn: "Monthly Marketing Budget",
        labelAr: "ميزانية التسويق الشهرية",
        options: [
          {
            value: "LESS_THAN_20K",
            labelEn: "Less than 20k EGP",
            labelAr: "أقل من 20 ألف جنيه",
          },
          {
            value: "TWENTY_TO_35K",
            labelEn: "20k - 35k EGP",
            labelAr: "20-35 ألف جنيه",
          },
          {
            value: "35K_TO_50K",
            labelEn: "35k - 50k EGP",
            labelAr: "35-50 ألف جنيه",
          },
          {
            value: "FIFTY_K_PLUS",
            labelEn: "50k+ EGP",
            labelAr: "أكتر من 50 ألف جنيه",
          },
        ],
      },
    ],
  },
  {
    titleEn: "Digital Vision",
    titleAr: "الرؤية الرقمية",
    fields: [
      {
        key: "hasFollowUpSystem",
        type: "radio",
        required: true,
        labelEn: "Do you have a reception/patient follow-up system?",
        labelAr: "عندك نظام متابعة مرضى/استقبال؟",
        options: [
          { value: "YES", labelEn: "Yes", labelAr: "أيوه" },
          { value: "NO", labelEn: "No", labelAr: "لأ" },
        ],
      },
      {
        key: "facebookLink",
        type: "text",
        required: true,
        labelEn: "Clinic Social Media Links (Facebook)",
        labelAr: "لينك السوشيال ميديا (فيسبوك)",
        placeholderEn: "Enter Facebook link",
        placeholderAr: "ادخل لينك الفيسبوك",
      },
      {
        key: "instagramLink",
        type: "text",
        required: true,
        labelEn: "Clinic Social Media Links (Instagram)",
        labelAr: "لينك السوشيال ميديا (انستقرام)",
        placeholderEn: "Enter Instagram link",
        placeholderAr: "ادخل لينك الانستقرام",
      },
      {
        key: "googleMapsLink",
        type: "text",
        required: true,
        labelEn: "Google Maps Link",
        labelAr: "لينك جوجل ماب",
        placeholderEn: "Enter Google Maps link",
        placeholderAr: "ادخل لينك جوجل ماب",
      },
      {
        key: "triedPaidMarketing",
        type: "textarea",
        required: true,
        labelEn: "Have you tried paid marketing before?",
        labelAr: "جربت تسويق مدفوع قبل كده؟",
        placeholderEn: "(Briefly explain your experience)",
        placeholderAr: "(اشرح تجربتك باختصار)",
      },
      {
        key: "topGoal2026",
        type: "textarea",
        required: true,
        labelEn: "What is your #1 clinic goal for 2026?",
        labelAr: "ايه أهم هدف لعيادتك في 2026؟",
        placeholderEn: "Be more specific about your goal",
        placeholderAr: "وضّح هدفك أكتر",
      },
      {
        key: "actionReadiness",
        type: "select",
        required: true,
        labelEn:
          "If we provide the exact plan to reach this goal, how soon are you ready to take action?",
        labelAr:
          "لو قدمنالك خطة واضحة لتحقيق الهدف ده، هتبدأ تتحرك بعد قد ايه؟",
        options: [
          {
            value: "IMMEDIATELY",
            labelEn: "Immediately (I am ready now)",
            labelAr: "فورًا (جاهز دلوقتي)",
          },
          {
            value: "WITHIN_30_DAYS",
            labelEn: "Within the next 30 days",
            labelAr: "خلال 30 يوم القادمين",
          },
          {
            value: "EXPLORING",
            labelEn: "I'm just exploring right now",
            labelAr: "بستكشف بس دلوقتي",
          },
        ],
      },
    ],
  },
];
