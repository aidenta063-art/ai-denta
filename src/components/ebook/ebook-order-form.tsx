"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { EbookOrderState } from "@/actions/ebook/create-ebook-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function EbookOrderForm({
  action,
}: {
  action: (
    prevState: EbookOrderState,
    formData: FormData,
  ) => Promise<EbookOrderState>;
}) {
  const t = useTranslations("Ebook");
  const [state, formAction, isPending] = useActionState<
    EbookOrderState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{t(`errors.${state.error}`)}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{t("fields.name.label")}</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder={t("fields.name.placeholder")}
          className="h-11 px-3.5 text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">{t("fields.phone.label")}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder={t("fields.phone.placeholder")}
          className="h-11 px-3.5 text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t("fields.email.label")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder={t("fields.email.placeholder")}
          className="h-11 px-3.5 text-base"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-2 h-11 bg-[#7E00C9] text-base hover:bg-[#7E00C9]/90"
      >
        {t("submit")}
      </Button>
    </form>
  );
}
