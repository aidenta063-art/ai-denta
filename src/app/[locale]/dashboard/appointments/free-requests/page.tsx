import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { listFreeBookingRequests } from "@/services/booking/appointments.service";
import { APP_TIME_ZONE } from "@/lib/timezone";
import { IntakeAnswersDialog } from "@/components/dashboard/intake-answers-dialog";
import { getIntakeFormSteps } from "@/services/content/intake-form.service";

export default async function FreeRequestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [requests, steps] = await Promise.all([
    listFreeBookingRequests(),
    getIntakeFormSteps(),
  ]);

  const formatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: APP_TIME_ZONE,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Free Consultation Requests
        </h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/appointments" locale={locale} />}
        >
          Back to appointments
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        No slot is reserved for these — call them in order, oldest first.
      </p>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="px-4 py-2 text-start">Requested at</th>
              <th className="px-4 py-2 text-start">Name</th>
              <th className="px-4 py-2 text-start">Phone</th>
              <th className="px-4 py-2 text-start">Email</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                  No free consultation requests yet.
                </td>
              </tr>
            )}
            {requests.map((booking) => (
              <tr
                key={booking.id}
                className="border-t border-border transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-2 text-card-foreground">
                  {formatter.format(booking.createdAt)}
                </td>
                <td className="px-4 py-2 text-card-foreground">
                  {booking.user?.name ?? booking.guestName ?? "—"}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {booking.guestPhone ? (
                    <a
                      href={`tel:${booking.guestPhone}`}
                      className="hover:text-foreground hover:underline"
                    >
                      {booking.guestPhone}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {booking.user?.email ?? booking.guestEmail ?? "—"}
                </td>
                <td className="px-4 py-2 text-end">
                  <IntakeAnswersDialog
                    name={booking.user?.name ?? booking.guestName ?? "Guest"}
                    intakeAnswers={booking.intakeAnswers}
                    steps={steps}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
