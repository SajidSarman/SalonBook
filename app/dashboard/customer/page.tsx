import { requireRole } from "@/lib/auth-guard"
import { AppointmentManagement } from "@/components/appointments/appointment-management"
import { ProfileManagement } from "@/components/dashboard/profile-management"

export default async function CustomerDashboardPage() {
  const session = await requireRole("customer")

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col py-8">
      <h1 className="font-heading text-3xl font-semibold">
        Customer Dashboard
      </h1>
      <p className="text-muted-foreground">
        Welcome back, {session.user.name}.
      </p>
      <AppointmentManagement role="customer" />
      <ProfileManagement
        name={session.user.name}
        email={session.user.email}
        image={session.user.image}
        phone={session.user.phone}
      />
    </div>
  )
}
