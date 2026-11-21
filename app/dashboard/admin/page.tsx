import { requireRole } from "@/lib/auth-guard"
import { AppointmentManagement } from "@/components/appointments/appointment-management"
import { UserManagement } from "@/components/users/user-management"

export default async function AdminDashboardPage() {
  const session = await requireRole("admin")

  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col px-6 py-16">
      <h1 className="font-heading text-3xl font-semibold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Signed in as {session.user.name}.</p>
      <AppointmentManagement role="admin" />
      <UserManagement />
    </main>
  )
}
