import { headers } from "next/headers"

import { auth } from "@/lib/auth"

export async function getApiSession() {
  return auth.api.getSession({ headers: await headers() })
}

export function hasRole(user: unknown, role: "customer" | "admin") {
  return (
    typeof user === "object" &&
    user !== null &&
    "role" in user &&
    user.role === role &&
    (!("isBlocked" in user) || user.isBlocked !== true)
  )
}
