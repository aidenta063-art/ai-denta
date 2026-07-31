import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listUsers } from "@/services/users/user.service";
import { deleteUserAction } from "@/actions/dashboard/users/delete-user";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default async function UsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const { q } = await searchParams;
  const users = await listUsers({ search: q });
  const removeAction = deleteUserAction.bind(null, locale);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-foreground">Users</h1>

      <form className="flex max-w-sm gap-2">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by name or email"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="px-4 py-2 text-start">Name</th>
              <th className="px-4 py-2 text-start">Email</th>
              <th className="px-4 py-2 text-start">Role</th>
              <th className="px-4 py-2 text-start">Plan</th>
              <th className="px-4 py-2 text-start">Bookings</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                  No users found.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-border transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-2 font-medium text-card-foreground">
                  {user.name ?? "—"}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {user.email}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={user.role} />
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {user.planType ?? "—"}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {user.bookingCount}
                </td>
                <td className="px-4 py-2 text-end">
                  <form action={removeAction.bind(null, user.id)}>
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
    </div>
  );
}
