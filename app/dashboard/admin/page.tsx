import { requireRole } from "@/lib/auth-guard"
import { AdminOverview } from "@/components/admin/admin-overview"
import { ServiceManagement } from "@/components/admin/service-management"
import { AppointmentManagement } from "@/components/appointments/appointment-management"
import { UserManagement } from "@/components/users/user-management"

export default async function AdminDashboardPage() {
  const session = await requireRole("admin")

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col py-8">
      <h1 className="font-heading text-3xl font-semibold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Signed in as {session.user.name}.</p>
      <AdminOverview />
      <ServiceManagement />
      <AppointmentManagement role="admin" />
      <UserManagement />
      <section className="mt-12" aria-labelledby="transactions-title">
        <h2
          id="transactions-title"
          className="mb-3 font-heading text-2xl font-semibold"
        >
          Transactions
        </h2>
        <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
          Transaction records will be available after payment and Stripe
          integration is configured.
        </p>
      </section>
    </div>
  )
}
