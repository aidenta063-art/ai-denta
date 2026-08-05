import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listDoctors } from "@/services/doctors/doctor.service";
import {
  deleteDoctorAction,
  setDoctorPhotoAction,
  clearDoctorPhotoAction,
} from "@/actions/dashboard/doctors/manage-doctor";
import { DoctorForm } from "@/components/dashboard/doctor-form";
import { DoctorPhotoUploader } from "@/components/dashboard/doctor-photo-uploader";
import type { DoctorServiceInput } from "@/lib/validation/doctor.schema";

export default async function DoctorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const doctors = await listDoctors();
  const removeAction = deleteDoctorAction.bind(null, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Our Doctors
        </h1>
      </div>

      {doctors.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No doctors yet — the &quot;Our Doctors&quot; section on the
          homepage won&apos;t show until you add one below.
        </p>
      )}

      {doctors.map((doctor) => (
        <Card key={doctor.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {doctor.nameEn}
              {!doctor.isActive && (
                <span className="ms-2 text-xs font-normal text-muted-foreground">
                  (inactive)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <DoctorPhotoUploader
              currentPhotoUrl={doctor.photoMedia?.url ?? null}
              setAction={setDoctorPhotoAction.bind(null, locale, doctor.id)}
              clearAction={clearDoctorPhotoAction.bind(null, locale, doctor.id)}
            />
            <DoctorForm
              locale={locale}
              doctor={{
                id: doctor.id,
                nameEn: doctor.nameEn,
                nameAr: doctor.nameAr,
                locationEn: doctor.locationEn,
                locationAr: doctor.locationAr,
                storyEn: doctor.storyEn,
                storyAr: doctor.storyAr,
                services: doctor.services as DoctorServiceInput[],
                sortOrder: doctor.sortOrder,
              }}
            />
            <form action={removeAction.bind(null, doctor.id)}>
              <Button size="sm" variant="destructive" type="submit">
                Delete
              </Button>
            </form>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a doctor</CardTitle>
        </CardHeader>
        <CardContent>
          <DoctorForm locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
