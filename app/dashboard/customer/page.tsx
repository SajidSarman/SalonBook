import { requireRole } from "@/lib/auth-guard"
import { AppointmentManagement } from "@/components/appointments/appointment-management"

export default async function CustomerDashboardPage() {
  const session = await requireRole("customer")

  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col px-6 py-16">
      <h1 className="font-heading text-3xl font-semibold">
        Customer Dashboard
      </h1>
      <p className="text-muted-foreground">
        Welcome back, {session.user.name}.
      </p>
      <AppointmentManagement role="customer" />
    </main>
  )
}
