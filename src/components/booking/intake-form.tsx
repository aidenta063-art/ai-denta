"use client";

import { useActionState, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { INTAKE_STEPS, type IntakeFieldConfig } from "@/lib/intake-fields";

export type IntakeFormState = {
  error?: "invalidInput" | "rateLimited" | "slotNoLongerAvailable" | "alreadyUsedFree";
};

const fieldClassName =
  "h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-3.5 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50";

const textareaClassName =
  "w-full min-w-0 rounded-lg border border-input bg-transparent px-3.5 py-2.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50";

export function IntakeForm({
  action,
}: {
  action: (
    prevState: IntakeFormState,
    formData: FormData,
  ) => Promise<IntakeFormState>;
}) {
  const t = useTranslations("Intake");
  const [state, formAction, isPending] = useActionState<IntakeFormState, FormData>(
    action,
    {},
  );
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const totalSteps = INTAKE_STEPS.length;
  const isLastStep = step === totalSteps - 1;

  function goNext() {
    const container = stepRefs.current[step];
    if (!container) return;
    // Validate only the current step's fields: relying on form.reportValidity()
    // here would also flag not-yet-filled required fields in later steps,
    // since Chromium doesn't reliably treat descendants of a display:none
    // ancestor as excluded from constraint validation.
    const fields = container.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input, select, textarea");
    for (const field of fields) {
      if (!field.reportValidity()) return;
    }
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{t(`errors.${state.error}`)}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            {t(`steps.step${step + 1}`)}
          </span>
          <span className="text-muted-foreground">
            {t("stepLabel", { current: step + 1, total: totalSteps })}
          </span>
        </div>
        <div className="flex gap-1.5">
          {INTAKE_STEPS.map((s, i) => (
            <div
              key={s.titleKey}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-[#7E00C9]" : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </div>

      {INTAKE_STEPS.map((stepConfig, i) => (
        <div
          key={stepConfig.titleKey}
          ref={(el) => {
            stepRefs.current[i] = el;
          }}
          className={i === step ? "flex flex-col gap-4" : "hidden"}
        >
          {stepConfig.fields.map((field) => (
            <IntakeField key={field.key} field={field} />
          ))}
        </div>
      ))}

      <div className="mt-2 flex gap-3">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 text-base"
            onClick={goBack}
          >
            {t("back")}
          </Button>
        )}
        {!isLastStep ? (
          <Button
            type="button"
            className="h-11 flex-1 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
            onClick={goNext}
          >
            {t("next")}
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 flex-1 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
          >
            {t("submit")}
          </Button>
        )}
      </div>
    </form>
  );
}

function IntakeField({ field }: { field: IntakeFieldConfig }) {
  const t = useTranslations("Intake");
  const label = t(`fields.${field.key}.label`);

  if (field.type === "select") {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={field.key}>{label}</Label>
        <select
          id={field.key}
          name={field.key}
          required
          defaultValue=""
          className={fieldClassName}
        >
          <option value="" disabled>
            {t("selectPlaceholder")}
          </option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {t(`fields.${field.key}.options.${opt}`)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <div className="flex gap-5">
          {field.options?.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <input
                type="radio"
                name={field.key}
                value={opt}
                required
                className="size-4 accent-[#7E00C9]"
              />
              {t(`fields.${field.key}.options.${opt}`)}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={field.key}>{label}</Label>
        <textarea
          id={field.key}
          name={field.key}
          required
          rows={3}
          placeholder={t(`fields.${field.key}.placeholder`)}
          className={textareaClassName}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={field.key}>{label}</Label>
      <Input
        id={field.key}
        name={field.key}
        type={field.type}
        required
        placeholder={t(`fields.${field.key}.placeholder`)}
        className="h-11 px-3.5 text-base"
      />
    </div>
  );
}
