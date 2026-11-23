"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import { getDashboardPath, getRole } from "@/lib/auth-redirect"
import { cn } from "@/lib/utils"

type NavLink = {
  href: string
  label: string
}

const publicLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
  // { href: "/sign-in", label: "Sign In" },
  // { href: "/sign-up", label: "Sign Up" },
]



function initialsFor(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { data: session, isPending } = authClient.useSession()

  const user = session?.user
  const role = user ? getRole(user) : undefined
  const dashboardHref = user ? getDashboardPath(user) : "/dashboard"
  const links: NavLink[] = user
    ? [
        { href: "/", label: "Home" },
        { href: "/services", label: "Browse Services" },
        { href: dashboardHref, label: "Dashboard" },
      ]
    : publicLinks

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const handleSignOut = async () => {
    const { error } = await authClient.signOut()

    if (error) {
      console.error("Could not sign out:", error)
      return
    }

    router.replace("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-semibold tracking-tight"
          onClick={() => setMobileOpen(false)}
        >
          <Scissors className="size-5 text-primary" />
          <h1 className="font-light text-2xl">SalonBook</h1>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {isPending ? (
            <div className="size-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar size="sm">
                  {user.image && (
                    <AvatarImage src={user.image} alt="" />
                  )}
                  <AvatarFallback>{initialsFor(user.name || "User")}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-32 truncate text-sm font-medium sm:block">
                  {user.name}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <span className="block truncate">{user.name}</span>
                    {role && (
                      <span className="block text-xs font-normal text-muted-foreground">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(dashboardHref)}>
                    <LayoutDashboard />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                    <LogOut />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/sign-in"
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className={buttonVariants({ size: "lg" })}
              >
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t bg-background px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <div className="mt-2 border-t pt-3">
                  <p className="px-3 text-sm font-medium">{user.name}</p>
                  {role && (
                    <p className="px-3 text-xs text-muted-foreground">{role}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    void handleSignOut()
                  }}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </>
            ) : (
              !isPending && (
                <div className="mt-2 grid grid-cols-2 gap-2 border-t pt-3">
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className={buttonVariants({ variant: "outline", size: "lg" })}
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className={buttonVariants({ size: "lg" })}
                  >
                    Register
                  </Link>
                </div>
              )
            )}
          </div>
        </nav>
      )}
    </header>
  )
}