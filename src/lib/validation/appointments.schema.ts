import { z } from "zod";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:MM (24h)");

export const workingHoursRuleSchema = z
  .object({
    weekday: z.coerce.number().int().min(0).max(6),
    startTime: timeSchema,
    endTime: timeSchema,
    slotLengthMinutes: z.coerce.number().int().min(5).max(240),
  })
  .refine((v) => v.startTime < v.endTime, {
    message: "startTime must be before endTime",
    path: ["endTime"],
  });

export const holidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  reason: z.string().trim().max(200).optional().or(z.literal("")),
});

export type WorkingHoursRuleInput = z.infer<typeof workingHoursRuleSchema>;
export type HolidayInput = z.infer<typeof holidaySchema>;
