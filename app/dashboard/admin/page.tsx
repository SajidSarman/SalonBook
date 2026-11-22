import { requireRole } from "@/lib/auth-guard"
import { AdminOverview } from "@/components/admin/admin-overview"
import { ServiceManagement } from "@/components/admin/service-management"
import { TransactionManagement } from "@/components/admin/transaction-management"
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
      <TransactionManagement />
    </div>
  )
}
