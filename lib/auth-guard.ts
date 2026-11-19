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

  if (getRole(session.user) !== role) {
    redirect("/dashboard")
  }

  return session
}
