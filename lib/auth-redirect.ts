export const USER_ROLES = ["customer", "salon", "admin"] as const

export type UserRole = (typeof USER_ROLES)[number]

const DASHBOARD_PATHS: Record<UserRole, string> = {
  customer: "/dashboard/customer",
  salon: "/dashboard/salon",
  admin: "/dashboard/admin",
}

export function getRole(user: unknown): UserRole {
  if (user && typeof user === "object" && "role" in user) {
    const role = (user as { role?: unknown }).role
    if (typeof role === "string" && USER_ROLES.includes(role as UserRole)) {
      return role as UserRole
    }
  }
  return "customer"
}

export function getDashboardPath(user: unknown): string {
  return DASHBOARD_PATHS[getRole(user)]
}
