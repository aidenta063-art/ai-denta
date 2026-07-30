import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { listHolidays } from "@/services/booking/appointments.service";
import { deleteHolidayAction } from "@/actions/dashboard/appointments/holidays";
import { AddHolidayForm } from "@/components/dashboard/add-holiday-form";

export default async function HolidaysPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const holidays = await listHolidays();
  const removeAction = deleteHolidayAction.bind(null, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Holidays</h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/appointments" locale={locale} />}
        >
          Back to appointments
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="px-4 py-2 text-start">Date</th>
              <th className="px-4 py-2 text-start">Reason</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {holidays.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={3}>
                  No holidays added yet.
                </td>
              </tr>
            )}
            {holidays.map((holiday) => (
              <tr key={holiday.id} className="border-t border-border transition-colors hover:bg-muted/40">
                <td className="px-4 py-2 text-card-foreground">
                  {holiday.date.toISOString().slice(0, 10)}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {holiday.reason ?? "—"}
                </td>
                <td className="px-4 py-2 text-end">
                  <form action={removeAction.bind(null, holiday.id)}>
                    <Button size="sm" variant="destructive" type="submit">
                      Delete
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="max-w-md rounded-xl border border-border bg-card shadow-sm p-6">
        <h2 className="mb-4 font-medium text-card-foreground">
          Add a holiday
        </h2>
        <AddHolidayForm locale={locale} />
      </div>
    </div>
  );
}
