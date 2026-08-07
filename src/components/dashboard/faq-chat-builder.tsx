"use client";

import { useActionState, useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  saveFaqQuestionsAction,
  type FaqChatBuilderState,
} from "@/actions/dashboard/content/faq-chat";
import type { Locale } from "@/i18n/routing";
import type { FaqQuestionConfig } from "@/lib/faq-chat-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EMPTY_QUESTION: FaqQuestionConfig = {
  qEn: "",
  aEn: "",
  qAr: "",
  aAr: "",
};

function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function FaqChatBuilder({
  locale,
  initialQuestions,
}: {
  locale: Locale;
  initialQuestions: FaqQuestionConfig[];
}) {
  const [questions, setQuestions] =
    useState<FaqQuestionConfig[]>(initialQuestions);
  const action = saveFaqQuestionsAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    FaqChatBuilderState,
    FormData
  >(action, {});

  function updateQuestion(i: number, patch: Partial<FaqQuestionConfig>) {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)),
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION }]);
  }

  function removeQuestion(i: number) {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function moveQuestion(i: number, dir: -1 | 1) {
    setQuestions((prev) => move(prev, i, dir));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>
            Please check your input — every question needs both an English and
            Arabic question and answer.
          </AlertDescription>
        </Alert>
      )}
      {state.success && (
        <Alert>
          <AlertDescription>
            Saved — the chat widget now shows these questions.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4">
        {questions.map((question, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-border p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">
                Question {i + 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={i === 0}
                  onClick={() => moveQuestion(i, -1)}
                >
                  <ChevronUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={i === questions.length - 1}
                  onClick={() => moveQuestion(i, 1)}
                >
                  <ChevronDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeQuestion(i)}
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Question (English)</Label>
                <Input
                  required
                  value={question.qEn}
                  onChange={(e) => updateQuestion(i, { qEn: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Question (Arabic)</Label>
                <Input
                  required
                  dir="rtl"
                  value={question.qAr}
                  onChange={(e) => updateQuestion(i, { qAr: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Answer (English)</Label>
                <textarea
                  required
                  rows={3}
                  value={question.aEn}
                  onChange={(e) => updateQuestion(i, { aEn: e.target.value })}
                  className="w-full min-w-0 rounded-lg border border-input bg-transparent px-3.5 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Answer (Arabic)</Label>
                <textarea
                  required
                  dir="rtl"
                  rows={3}
                  value={question.aAr}
                  onChange={(e) => updateQuestion(i, { aAr: e.target.value })}
                  className="w-full min-w-0 rounded-lg border border-input bg-transparent px-3.5 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={addQuestion}
      >
        Add question
      </Button>

      <input
        type="hidden"
        name="questionsJson"
        value={JSON.stringify(questions)}
      />

      <Button type="submit" disabled={isPending} className="w-fit">
        Save
      </Button>
    </form>
  );
}
