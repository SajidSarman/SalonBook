import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { getRole, type UserRole } from "@/lib/auth-redirect"

export async function requireRole(role: UserRole) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

  if ("isBlocked" in session.user && session.user.isBlocked === true) {
    redirect("/sign-in?blocked=1")
  }

  if (getRole(session.user) !== role) {
    redirect("/dashboard")
  }

  return session
}
