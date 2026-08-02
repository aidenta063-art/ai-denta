export type IntakeFieldType = "text" | "tel" | "email" | "select" | "radio" | "textarea";

export interface IntakeFieldConfig {
  key: string;
  type: IntakeFieldType;
  options?: string[];
}

export interface IntakeStepConfig {
  titleKey: string;
  fields: IntakeFieldConfig[];
}

export const INTAKE_STEPS: IntakeStepConfig[] = [
  {
    titleKey: "step1",
    fields: [
      { key: "name", type: "text" },
      { key: "phone", type: "tel" },
      { key: "email", type: "email" },
      { key: "role", type: "select", options: ["CLINIC_OWNER", "CLINIC_MANAGER", "TEAM_MEMBER"] },
    ],
  },
  {
    titleKey: "step2",
    fields: [
      { key: "clinicLocation", type: "text" },
      {
        key: "yearsInOperation",
        type: "select",
        options: ["LESS_THAN_1", "ONE_TO_THREE", "THREE_TO_FIVE", "FIVE_PLUS"],
      },
      {
        key: "teamSize",
        type: "select",
        options: ["ONE_TO_TWO", "THREE_TO_FIVE", "SIX_TO_TEN", "TEN_PLUS"],
      },
      {
        key: "weeklyPatients",
        type: "select",
        options: ["BELOW_20", "TWENTY_TO_FIFTY", "ABOVE_FIFTY"],
      },
    ],
  },
  {
    titleKey: "step3",
    fields: [
      { key: "targetPatientClass", type: "select", options: ["CLASS_A", "CLASS_B", "CLASS_C"] },
      { key: "focusService", type: "text" },
      { key: "focusServicePrice", type: "text" },
      {
        key: "marketingBudget",
        type: "select",
        options: ["LESS_THAN_20K", "TWENTY_TO_35K", "35K_TO_50K", "FIFTY_K_PLUS"],
      },
    ],
  },
  {
    titleKey: "step4",
    fields: [
      { key: "hasFollowUpSystem", type: "radio", options: ["YES", "NO"] },
      { key: "facebookLink", type: "text" },
      { key: "instagramLink", type: "text" },
      { key: "googleMapsLink", type: "text" },
      { key: "triedPaidMarketing", type: "textarea" },
      { key: "topGoal2026", type: "textarea" },
      {
        key: "actionReadiness",
        type: "select",
        options: ["IMMEDIATELY", "WITHIN_30_DAYS", "EXPLORING"],
      },
    ],
  },
];
