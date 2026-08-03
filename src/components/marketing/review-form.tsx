"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createReviewAction,
  type ReviewFormState,
} from "@/actions/reviews/create-review";

export function ReviewForm() {
  const t = useTranslations("HomePage.reviews");
  const [state, formAction, isPending] = useActionState<
    ReviewFormState,
    FormData
  >(createReviewAction, {});
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  if (state.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 rounded-2xl bg-secondary/50 p-6 text-center"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Check className="size-6" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {t("successTitle")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("successDescription")}
        </p>
      </motion.div>
    );
  }

  const shownRating = hoverRating || rating;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{t(`errors.${state.error}`)}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="review-name">{t("nameLabel")}</Label>
        <Input
          id="review-name"
          name="name"
          required
          placeholder={t("namePlaceholder")}
          className="h-11 px-3.5 text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("ratingLabel")}</Label>
        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
          {Array.from({ length: 5 }, (_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                aria-label={String(value)}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                className="p-0.5"
              >
                <Star
                  className={`size-7 transition-colors ${
                    value <= shownRating
                      ? "fill-[#7E00C9] text-[#7E00C9]"
                      : "fill-none text-muted-foreground/30"
                  }`}
                />
              </button>
            );
          })}
        </div>
        <input type="hidden" name="rating" value={rating} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="review-text">{t("textLabel")}</Label>
        <textarea
          id="review-text"
          name="text"
          required
          rows={4}
          placeholder={t("textPlaceholder")}
          className="w-full min-w-0 rounded-lg border border-input bg-transparent px-3.5 py-2.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || rating === 0}
        className="h-11 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
      >
        {isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
