"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  createTeamMemberAction,
  updateTeamMemberAction,
  type TeamMemberActionState,
} from "@/actions/dashboard/team/manage-team-member";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadMediaFromBrowser } from "@/lib/media-upload";

type TeamMemberDefaults = {
  id: string;
  nameEn: string;
  nameAr: string;
  sortOrder: number;
  photoMediaId: string | null;
  photoUrl: string | null;
};

export function TeamMemberForm({
  locale,
  member,
}: {
  locale: Locale;
  member?: TeamMemberDefaults;
}) {
  const action = member
    ? updateTeamMemberAction.bind(null, locale, member.id)
    : createTeamMemberAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    TeamMemberActionState,
    FormData
  >(action, {});

  const [photoMediaId, setPhotoMediaId] = useState<string | null>(
    member?.photoMediaId ?? null,
  );
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(
    member?.photoUrl ?? null,
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      e.target.value = "";
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoError(null);

    try {
      const result = await uploadMediaFromBrowser(file);
      if ("error" in result) {
        setPhotoError(result.error);
        return;
      }
      setPhotoMediaId(result.media.id);
      setPhotoPreviewUrl(result.media.url);
    } catch (err) {
      console.error(err);
      setPhotoError("Upload failed — check your connection and try again.");
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  }

  function removePhoto() {
    setPhotoMediaId(null);
    setPhotoPreviewUrl(null);
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>
            Please check your input and try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label>Photo</Label>
        {photoError && (
          <Alert variant="destructive">
            <AlertDescription>{photoError}</AlertDescription>
          </Alert>
        )}
        {photoPreviewUrl && (
          <Image
            key={photoPreviewUrl}
            src={photoPreviewUrl}
            alt=""
            width={112}
            height={112}
            className="size-28 rounded-xl border border-border bg-muted object-cover"
          />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handlePhotoChange}
            disabled={isUploadingPhoto}
            className="text-sm"
          />
          {isUploadingPhoto && (
            <Button size="sm" disabled>
              Uploading…
            </Button>
          )}
          {photoMediaId && !isUploadingPhoto && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={removePhoto}
            >
              Remove photo
            </Button>
          )}
        </div>
      </div>
      <input type="hidden" name="photoMediaId" value={photoMediaId ?? ""} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Name (English)</Label>
          <Input name="nameEn" defaultValue={member?.nameEn} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Name (Arabic)</Label>
          <Input name="nameAr" dir="rtl" defaultValue={member?.nameAr} required />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:w-40">
        <Label>Sort order</Label>
        <Input
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={member?.sortOrder ?? 0}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || isUploadingPhoto}
        className="w-fit"
      >
        {member ? "Save" : "Add team member"}
      </Button>
    </form>
  );
}
