"use client";

import { useActionState, useState } from "react";
import {
  createDoctorAction,
  updateDoctorAction,
  type DoctorActionState,
} from "@/actions/dashboard/doctors/manage-doctor";
import type { Locale } from "@/i18n/routing";
import type { DoctorServiceInput } from "@/lib/validation/doctor.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type DoctorDefaults = {
  id: string;
  nameEn: string;
  nameAr: string;
  locationEn: string;
  locationAr: string;
  storyEn: string;
  storyAr: string;
  services: DoctorServiceInput[];
  sortOrder: number;
};

const EMPTY_SERVICE: DoctorServiceInput = {
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
};

export function DoctorForm({
  locale,
  doctor,
}: {
  locale: Locale;
  doctor?: DoctorDefaults;
}) {
  const action = doctor
    ? updateDoctorAction.bind(null, locale, doctor.id)
    : createDoctorAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    DoctorActionState,
    FormData
  >(action, {});
  const [services, setServices] = useState<DoctorServiceInput[]>(
    doctor?.services ?? [],
  );
  // Rows the admin added but left blank shouldn't block saving the rest
  // of the form — drop them instead of failing validation on submit.
  const filledServices = services.filter((s) => s.nameEn.trim().length > 0);

  function updateService(
    index: number,
    field: keyof DoctorServiceInput,
    value: string,
  ) {
    setServices((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  }

  function addService() {
    setServices((prev) => [...prev, { ...EMPTY_SERVICE }]);
  }

  function removeService(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Name (English)</Label>
          <Input name="nameEn" defaultValue={doctor?.nameEn} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Name (Arabic)</Label>
          <Input
            name="nameAr"
            dir="rtl"
            defaultValue={doctor?.nameAr}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Location (English)</Label>
          <Input name="locationEn" defaultValue={doctor?.locationEn} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Location (Arabic)</Label>
          <Input
            name="locationAr"
            dir="rtl"
            defaultValue={doctor?.locationAr}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Success story (English)</Label>
          <textarea
            name="storyEn"
            rows={4}
            defaultValue={doctor?.storyEn}
            required
            className="w-full min-w-0 rounded-lg border border-input bg-transparent px-3.5 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Success story (Arabic)</Label>
          <textarea
            name="storyAr"
            dir="rtl"
            rows={4}
            defaultValue={doctor?.storyAr}
            required
            className="w-full min-w-0 rounded-lg border border-input bg-transparent px-3.5 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <Label>Services provided</Label>
        {services.map((service, i) => (
          <div
            key={i}
            className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2"
          >
            <Input
              placeholder="Service name (English)"
              value={service.nameEn}
              onChange={(e) => updateService(i, "nameEn", e.target.value)}
            />
            <Input
              placeholder="اسم الخدمة (عربي)"
              dir="rtl"
              value={service.nameAr}
              onChange={(e) => updateService(i, "nameAr", e.target.value)}
            />
            <Input
              placeholder="Short description (English)"
              value={service.descriptionEn}
              onChange={(e) =>
                updateService(i, "descriptionEn", e.target.value)
              }
            />
            <Input
              placeholder="وصف مختصر (عربي)"
              dir="rtl"
              value={service.descriptionAr}
              onChange={(e) =>
                updateService(i, "descriptionAr", e.target.value)
              }
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="w-fit sm:col-span-2"
              onClick={() => removeService(i)}
            >
              Remove service
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-fit"
          onClick={addService}
        >
          Add service
        </Button>
      </div>
      <input
        type="hidden"
        name="servicesJson"
        value={JSON.stringify(filledServices)}
      />

      <div className="flex flex-col gap-2 sm:w-40">
        <Label>Sort order</Label>
        <Input
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={doctor?.sortOrder ?? 0}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        {doctor ? "Save" : "Add doctor"}
      </Button>
    </form>
  );
}
