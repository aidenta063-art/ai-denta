"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/routing";
import {
  createComparisonRow,
  updateComparisonRow,
  deleteComparisonRow,
  saveComparisonHeaderContent,
  CMS_TAGS,
} from "@/services/content/cms.service";
import {
  comparisonRowFormSchema,
  comparisonHeaderFormSchema,
} from "@/lib/validation/cms.schema";

export type ComparisonRowActionState = {
  error?: "invalidInput";
};

export type ComparisonHeaderActionState = {
  error?: "invalidInput";
  success?: boolean;
};

export async function saveComparisonHeaderAction(
  locale: Locale,
  _prevState: ComparisonHeaderActionState,
  formData: FormData,
): Promise<ComparisonHeaderActionState> {
  const session = await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = comparisonHeaderFormSchema.safeParse({
    eyebrowEn: formData.get("eyebrowEn"),
    titleEn: formData.get("titleEn"),
    subtitleEn: formData.get("subtitleEn"),
    featureLabelEn: formData.get("featureLabelEn"),
    freeNameEn: formData.get("freeNameEn"),
    paidNameEn: formData.get("paidNameEn"),
    mostPopularEn: formData.get("mostPopularEn"),
    eyebrowAr: formData.get("eyebrowAr"),
    titleAr: formData.get("titleAr"),
    subtitleAr: formData.get("subtitleAr"),
    featureLabelAr: formData.get("featureLabelAr"),
    freeNameAr: formData.get("freeNameAr"),
    paidNameAr: formData.get("paidNameAr"),
    mostPopularAr: formData.get("mostPopularAr"),
  });

  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await saveComparisonHeaderContent(parsed.data, session.user.id);
  updateTag(CMS_TAGS.comparisonHeader);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/content/comparison`);
  return { success: true };
}

async function revalidateHomepage(locale: Locale) {
  updateTag(CMS_TAGS.comparisonRows);
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath(`/${locale}/dashboard/content/comparison`);
}

function parseComparisonRowForm(formData: FormData) {
  return comparisonRowFormSchema.safeParse({
    labelEn: formData.get("labelEn"),
    labelAr: formData.get("labelAr"),
    freeValueEn: formData.get("freeValueEn"),
    freeValueAr: formData.get("freeValueAr"),
    paidValueEn: formData.get("paidValueEn"),
    paidValueAr: formData.get("paidValueAr"),
    sortOrder: formData.get("sortOrder"),
  });
}

export async function createComparisonRowAction(
  locale: Locale,
  _prevState: ComparisonRowActionState,
  formData: FormData,
): Promise<ComparisonRowActionState> {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = parseComparisonRowForm(formData);
  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await createComparisonRow(parsed.data);
  await revalidateHomepage(locale);
  return {};
}

export async function updateComparisonRowAction(
  locale: Locale,
  rowId: string,
  _prevState: ComparisonRowActionState,
  formData: FormData,
): Promise<ComparisonRowActionState> {
  await requireRole([Role.ADMIN, Role.STAFF], locale);

  const parsed = parseComparisonRowForm(formData);
  if (!parsed.success) {
    return { error: "invalidInput" };
  }

  await updateComparisonRow(rowId, parsed.data);
  await revalidateHomepage(locale);
  return {};
}

export async function deleteComparisonRowAction(locale: Locale, rowId: string) {
  await requireRole([Role.ADMIN, Role.STAFF], locale);
  await deleteComparisonRow(rowId);
  await revalidateHomepage(locale);
}
