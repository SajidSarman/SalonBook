"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarClock,
  LayoutDashboard,
  ReceiptText,
  Scissors,
  Search,
  Users,
  UserRound,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/auth-redirect"

type DashboardLink = {
  href: string
  label: string
  icon: LucideIcon
}

const adminLinks: DashboardLink[] = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  {
    href: "/dashboard/admin#service-management-title",
    label: "Manage services",
    icon: Scissors,
  },
  {
    href: "/dashboard/admin#appointment-management-title",
    label: "Appointments",
    icon: CalendarClock,
  },
  {
    href: "/dashboard/admin#user-management-title",
    label: "Users",
    icon: Users,
  },
  {
    href: "/dashboard/admin#transactions-title",
    label: "Transactions",
    icon: ReceiptText,
  },
]

const customerLinks: DashboardLink[] = [
  { href: "/dashboard/customer", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/dashboard/customer#appointment-management-title",
    label: "My appointments",
    icon: CalendarClock,
  },
  {
    href: "/dashboard/customer#profile-management-title",
    label: "My profile",
    icon: UserRound,
  },
  { href: "/services", label: "Browse services", icon: Search },
]

export function DashboardSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const links = role === "admin" ? adminLinks : customerLinks

  return (
    <aside className="border-b bg-card md:sticky md:top-16 md:h-[calc(100svh-4rem)] md:w-60 md:shrink-0 md:border-r md:border-b-0">
      <div className="px-4 pt-4 pb-2 md:px-5 md:pt-6">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {role} dashboard
        </p>
      </div>
      <nav
        aria-label={`${role} dashboard navigation`}
        className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:px-3 md:pb-4"
      >
        {links.map(({ href, label, icon: Icon }) => {
          const targetPath = href.split("#")[0]
          const isOverviewLink = !href.includes("#")
          const isActive = isOverviewLink && pathname === targetPath

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
