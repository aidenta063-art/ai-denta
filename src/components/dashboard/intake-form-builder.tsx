"use client";

import { useActionState, useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  saveIntakeFormStepsAction,
  type IntakeFormBuilderState,
} from "@/actions/dashboard/content/intake-form";
import type { Locale } from "@/i18n/routing";
import type {
  IntakeFieldConfig,
  IntakeFieldType,
  IntakeOptionConfig,
  IntakeStepConfig,
} from "@/lib/intake-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FIELD_TYPES: { value: IntakeFieldType; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "tel", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "textarea", label: "Long text" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Radio buttons" },
];

const EMPTY_FIELD: IntakeFieldConfig = {
  key: "",
  type: "text",
  required: true,
  labelEn: "",
  labelAr: "",
};

const EMPTY_OPTION: IntakeOptionConfig = {
  value: "",
  labelEn: "",
  labelAr: "",
};

function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function IntakeFormBuilder({
  locale,
  initialSteps,
}: {
  locale: Locale;
  initialSteps: IntakeStepConfig[];
}) {
  const [steps, setSteps] = useState<IntakeStepConfig[]>(initialSteps);
  const action = saveIntakeFormStepsAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    IntakeFormBuilderState,
    FormData
  >(action, {});

  function updateStep(i: number, patch: Partial<IntakeStepConfig>) {
    setSteps((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    );
  }

  function addStep() {
    setSteps((prev) => [...prev, { titleEn: "", titleAr: "", fields: [] }]);
  }

  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }

  function moveStep(i: number, dir: -1 | 1) {
    setSteps((prev) => move(prev, i, dir));
  }

  function updateField(
    stepIdx: number,
    fieldIdx: number,
    patch: Partial<IntakeFieldConfig>,
  ) {
    setSteps((prev) =>
      prev.map((s, si) =>
        si !== stepIdx
          ? s
          : {
              ...s,
              fields: s.fields.map((f, fi) =>
                fi === fieldIdx ? { ...f, ...patch } : f,
              ),
            },
      ),
    );
  }

  function addField(stepIdx: number) {
    setSteps((prev) =>
      prev.map((s, si) =>
        si !== stepIdx
          ? s
          : { ...s, fields: [...s.fields, { ...EMPTY_FIELD }] },
      ),
    );
  }

  function removeField(stepIdx: number, fieldIdx: number) {
    setSteps((prev) =>
      prev.map((s, si) =>
        si !== stepIdx
          ? s
          : { ...s, fields: s.fields.filter((_, fi) => fi !== fieldIdx) },
      ),
    );
  }

  function moveField(stepIdx: number, fieldIdx: number, dir: -1 | 1) {
    setSteps((prev) =>
      prev.map((s, si) =>
        si !== stepIdx ? s : { ...s, fields: move(s.fields, fieldIdx, dir) },
      ),
    );
  }

  function updateOption(
    stepIdx: number,
    fieldIdx: number,
    optIdx: number,
    patch: Partial<IntakeOptionConfig>,
  ) {
    setSteps((prev) =>
      prev.map((s, si) =>
        si !== stepIdx
          ? s
          : {
              ...s,
              fields: s.fields.map((f, fi) =>
                fi !== fieldIdx
                  ? f
                  : {
                      ...f,
                      options: (f.options ?? []).map((o, oi) =>
                        oi === optIdx ? { ...o, ...patch } : o,
                      ),
                    },
              ),
            },
      ),
    );
  }

  function addOption(stepIdx: number, fieldIdx: number) {
    setSteps((prev) =>
      prev.map((s, si) =>
        si !== stepIdx
          ? s
          : {
              ...s,
              fields: s.fields.map((f, fi) =>
                fi !== fieldIdx
                  ? f
                  : {
                      ...f,
                      options: [...(f.options ?? []), { ...EMPTY_OPTION }],
                    },
              ),
            },
      ),
    );
  }

  function removeOption(stepIdx: number, fieldIdx: number, optIdx: number) {
    setSteps((prev) =>
      prev.map((s, si) =>
        si !== stepIdx
          ? s
          : {
              ...s,
              fields: s.fields.map((f, fi) =>
                fi !== fieldIdx
                  ? f
                  : {
                      ...f,
                      options: (f.options ?? []).filter(
                        (_, oi) => oi !== optIdx,
                      ),
                    },
              ),
            },
      ),
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>
            Please check your input — every question and option needs both an
            English and Arabic label, and dropdown/radio questions need at least
            one option.
          </AlertDescription>
        </Alert>
      )}
      {state.success && (
        <Alert>
          <AlertDescription>
            Saved — the booking form now reflects these questions.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-6">
        {steps.map((step, stepIdx) => (
          <div
            key={stepIdx}
            className="flex flex-col gap-4 rounded-xl border border-border p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">
                Step {stepIdx + 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={stepIdx === 0}
                  onClick={() => moveStep(stepIdx, -1)}
                >
                  <ChevronUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={stepIdx === steps.length - 1}
                  onClick={() => moveStep(stepIdx, 1)}
                >
                  <ChevronDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeStep(stepIdx)}
                >
                  <Trash2 className="size-3.5" />
                  Remove step
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Step title (English)</Label>
                <Input
                  required
                  value={step.titleEn}
                  onChange={(e) =>
                    updateStep(stepIdx, { titleEn: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Step title (Arabic)</Label>
                <Input
                  required
                  dir="rtl"
                  value={step.titleAr}
                  onChange={(e) =>
                    updateStep(stepIdx, { titleAr: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {step.fields.map((field, fieldIdx) => (
                <FieldEditor
                  key={fieldIdx}
                  field={field}
                  isFirst={fieldIdx === 0}
                  isLast={fieldIdx === step.fields.length - 1}
                  onChange={(patch) => updateField(stepIdx, fieldIdx, patch)}
                  onRemove={() => removeField(stepIdx, fieldIdx)}
                  onMove={(dir) => moveField(stepIdx, fieldIdx, dir)}
                  onAddOption={() => addOption(stepIdx, fieldIdx)}
                  onRemoveOption={(optIdx) =>
                    removeOption(stepIdx, fieldIdx, optIdx)
                  }
                  onUpdateOption={(optIdx, patch) =>
                    updateOption(stepIdx, fieldIdx, optIdx, patch)
                  }
                />
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-fit"
                onClick={() => addField(stepIdx)}
              >
                Add question
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={addStep}
      >
        Add step
      </Button>

      <input type="hidden" name="stepsJson" value={JSON.stringify(steps)} />

      <Button type="submit" disabled={isPending} className="w-fit">
        Save
      </Button>
    </form>
  );
}

function FieldEditor({
  field,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMove,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
}: {
  field: IntakeFieldConfig;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<IntakeFieldConfig>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onAddOption: () => void;
  onRemoveOption: (optIdx: number) => void;
  onUpdateOption: (optIdx: number, patch: Partial<IntakeOptionConfig>) => void;
}) {
  const hasOptions = field.type === "select" || field.type === "radio";
  const hasPlaceholder =
    field.type === "text" ||
    field.type === "tel" ||
    field.type === "email" ||
    field.type === "textarea";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <select
          value={field.type}
          onChange={(e) =>
            onChange({ type: e.target.value as IntakeFieldType })
          }
          className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
        >
          {FIELD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <label className="flex items-center gap-1.5 px-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onChange({ required: e.target.checked })}
              className="size-3.5 accent-[#7E00C9]"
            />
            Required
          </label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isFirst}
            onClick={() => onMove(-1)}
          >
            <ChevronUp className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isLast}
            onClick={() => onMove(1)}
          >
            <ChevronDown className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={onRemove}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          required
          placeholder="Question label (English)"
          value={field.labelEn}
          onChange={(e) => onChange({ labelEn: e.target.value })}
        />
        <Input
          required
          dir="rtl"
          placeholder="سؤال بالعربي"
          value={field.labelAr}
          onChange={(e) => onChange({ labelAr: e.target.value })}
        />
      </div>

      {hasPlaceholder && (
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Placeholder (English, optional)"
            value={field.placeholderEn ?? ""}
            onChange={(e) => onChange({ placeholderEn: e.target.value })}
          />
          <Input
            dir="rtl"
            placeholder="نص توضيحي (اختياري)"
            value={field.placeholderAr ?? ""}
            onChange={(e) => onChange({ placeholderAr: e.target.value })}
          />
        </div>
      )}

      {hasOptions && (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          {(field.options ?? []).map((opt, optIdx) => (
            <div key={optIdx} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input
                required
                placeholder="Option (English)"
                value={opt.labelEn}
                onChange={(e) =>
                  onUpdateOption(optIdx, { labelEn: e.target.value })
                }
              />
              <Input
                required
                dir="rtl"
                placeholder="اختيار بالعربي"
                value={opt.labelAr}
                onChange={(e) =>
                  onUpdateOption(optIdx, { labelAr: e.target.value })
                }
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => onRemoveOption(optIdx)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-fit"
            onClick={onAddOption}
          >
            Add option
          </Button>
        </div>
      )}
    </div>
  );
}
