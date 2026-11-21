import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { auth } from "@/lib/auth"
import { getRole } from "@/lib/auth-redirect"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  if ("isBlocked" in session.user && session.user.isBlocked === true) {
    redirect("/sign-in?blocked=1")
  }

  const role = getRole(session.user)

  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col md:flex-row">
      <DashboardSidebar role={role} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
