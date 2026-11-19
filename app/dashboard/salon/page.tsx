import { requireRole } from "@/lib/auth-guard"

export default async function SalonDashboardPage() {
  const session = await requireRole("salon")

  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col gap-2 px-6 py-16">
      <h1 className="font-heading text-3xl font-semibold">Salon Dashboard</h1>
      <p className="text-muted-foreground">
        Manage your salon, {session.user.name}.
      </p>
    </main>
  )
}
