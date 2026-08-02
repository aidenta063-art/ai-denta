/** English labels for admin views — the intake form itself is bilingual
 * (see messages/en.json / ar.json "Intake"), but the dashboard is
 * English-only, so it gets its own flat label map instead of pulling in
 * next-intl. */
export const INTAKE_FIELD_LABELS: Record<string, string> = {
  role: "Role",
  clinicLocation: "Clinic Location",
  yearsInOperation: "Years in Operation",
  teamSize: "Total Team Size",
  weeklyPatients: "Average Weekly Patients",
  targetPatientClass: "Target Patient Class",
  focusService: "Focus Service",
  focusServicePrice: "Focus Service Price",
  marketingBudget: "Monthly Marketing Budget",
  hasFollowUpSystem: "Has Follow-up System",
  facebookLink: "Facebook",
  instagramLink: "Instagram",
  googleMapsLink: "Google Maps",
  triedPaidMarketing: "Tried Paid Marketing Before",
  topGoal2026: "#1 Goal for 2026",
  actionReadiness: "Action Readiness",
};

export const INTAKE_OPTION_LABELS: Record<string, string> = {
  CLINIC_OWNER: "Clinic Owner",
  CLINIC_MANAGER: "Clinic Manager",
  TEAM_MEMBER: "Team Member",
  LESS_THAN_1: "Less than 1 year",
  ONE_TO_THREE: "1–3 years",
  THREE_TO_FIVE: "3–5 years",
  FIVE_PLUS: "5+ years",
  ONE_TO_TWO: "1–2",
  SIX_TO_TEN: "6–10",
  TEN_PLUS: "10+",
  BELOW_20: "Below 20",
  TWENTY_TO_FIFTY: "20-50",
  ABOVE_FIFTY: "Above 50",
  CLASS_A: "Class A",
  CLASS_B: "Class B",
  CLASS_C: "Class C",
  LESS_THAN_20K: "Less than 20k EGP",
  TWENTY_TO_35K: "20k - 35k EGP",
  "35K_TO_50K": "35k - 50k EGP",
  FIFTY_K_PLUS: "50k+ EGP",
  YES: "Yes",
  NO: "No",
  IMMEDIATELY: "Immediately (ready now)",
  WITHIN_30_DAYS: "Within the next 30 days",
  EXPLORING: "Just exploring",
};

/** Ordered keys, matching the form's step order, for consistent display. */
export const INTAKE_ANSWER_ORDER = [
  "role",
  "clinicLocation",
  "yearsInOperation",
  "teamSize",
  "weeklyPatients",
  "targetPatientClass",
  "focusService",
  "focusServicePrice",
  "marketingBudget",
  "hasFollowUpSystem",
  "facebookLink",
  "instagramLink",
  "googleMapsLink",
  "triedPaidMarketing",
  "topGoal2026",
  "actionReadiness",
] as const;

export function formatIntakeAnswerValue(key: string, value: unknown): string {
  if (typeof value !== "string") return "—";
  return INTAKE_OPTION_LABELS[value] ?? value;
}
