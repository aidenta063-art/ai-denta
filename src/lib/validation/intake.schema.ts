import { z } from "zod";
import { emailSchema } from "@/lib/validation/auth.schema";

export const intakeSchema = z.object({
  // Step 1 — Let's Get to Know You
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(5).max(20),
  email: emailSchema,
  role: z.enum(["CLINIC_OWNER", "CLINIC_MANAGER", "TEAM_MEMBER"]),

  // Step 2 — Clinic Overview
  clinicLocation: z.string().trim().min(2).max(200),
  yearsInOperation: z.enum(["LESS_THAN_1", "ONE_TO_THREE", "THREE_TO_FIVE", "FIVE_PLUS"]),
  teamSize: z.enum(["ONE_TO_TWO", "THREE_TO_FIVE", "SIX_TO_TEN", "TEN_PLUS"]),
  weeklyPatients: z.enum(["BELOW_20", "TWENTY_TO_FIFTY", "ABOVE_FIFTY"]),

  // Step 3 — Growth & Revenue Goals
  targetPatientClass: z.enum(["GENERAL", "PREMIUM", "BOTH"]),
  focusService: z.string().trim().min(2).max(200),
  focusServicePrice: z.string().trim().min(1).max(50),
  marketingBudget: z.enum(["LESS_THAN_20K", "TWENTY_TO_35K", "35K_TO_50K", "FIFTY_K_PLUS"]),

  // Step 4 — Digital Vision
  hasFollowUpSystem: z.enum(["YES", "NO"]),
  facebookLink: z.string().trim().min(1).max(300),
  instagramLink: z.string().trim().min(1).max(300),
  googleMapsLink: z.string().trim().min(1).max(300),
  triedPaidMarketing: z.string().trim().min(1).max(1000),
  topGoal2026: z.string().trim().min(1).max(1000),
  actionReadiness: z.enum(["IMMEDIATELY", "WITHIN_30_DAYS", "EXPLORING"]),
});

export type IntakeInput = z.infer<typeof intakeSchema>;

// Core contact fields go on Booking's own columns; everything else is
// stored together as intakeAnswers JSON (see prisma schema).
export const INTAKE_CORE_FIELDS = ["name", "email", "phone"] as const;
