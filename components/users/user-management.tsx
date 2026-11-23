"use client"

import * as React from "react"
import { Ban, CircleCheck, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

type UserRecord = {
  id: string
  name: string
  email: string
  image: string | null
  role: "customer" | "admin"
  isBlocked: boolean
}

function parseUsers(value: unknown): UserRecord[] {
  if (!Array.isArray(value)) {
    throw new Error("The users API returned an invalid response.")
  }

  return value.map((item) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("The users API returned an invalid user.")
    }

    const user = item as Record<string, unknown>
    if (
      typeof user.id !== "string" ||
      typeof user.name !== "string" ||
      typeof user.email !== "string" ||
      (user.role !== "customer" && user.role !== "admin") ||
      typeof user.isBlocked !== "boolean"
    ) {
      throw new Error("The users API returned invalid user fields.")
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: typeof user.image === "string" ? user.image : null,
      role: user.role,
      isBlocked: user.isBlocked,
    }
  })
}

export function UserManagement() {
  const { success, error: showError } = useToast()
  const [users, setUsers] = React.useState<UserRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [busyId, setBusyId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    async function loadUsers() {
      try {
        const response = await fetch("/api/admin/users", {
          cache: "no-store",
        })
        const result: unknown = await response.json()

        if (!response.ok) {
          const message =
            typeof result === "object" &&
            result !== null &&
            "message" in result &&
            typeof result.message === "string"
              ? result.message
              : "Could not load users."
          throw new Error(message)
        }

        const data = parseUsers(result)
        if (active) {
          setUsers(data)
        }
      } catch (requestError) {
        if (active) {
          showError(
            "Could not load users",
            requestError instanceof Error
              ? requestError.message
              : "Could not load users."
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadUsers()
    return () => {
      active = false
    }
  }, [showError])

  async function setBlocked(user: UserRecord, isBlocked: boolean) {
    setBusyId(user.id)

    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(user.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isBlocked }),
        }
      )
      const result: unknown = await response.json()

      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "message" in result &&
          typeof result.message === "string"
            ? result.message
            : "Could not update user."
        throw new Error(message)
      }

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, isBlocked } : item
        )
      )
      success(
        `${user.name || user.email} ${isBlocked ? "blocked" : "unblocked"}.`
      )
    } catch (requestError) {
      showError(
        "Could not update user",
        requestError instanceof Error
          ? requestError.message
          : "Could not update user."
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section id="user-management-title" className="mt-12 scroll-mt-24">
      <div className="mb-5 flex items-center gap-3">
        <Users className="size-5" />
        <h2 className="font-heading text-2xl font-semibold">Users</h2>
      </div>


      {loading ? (
        <p className="text-sm text-muted-foreground">Loading users…</p>
      ) : users.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
          No users found.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border">
          {users.map((user) => (
            <article
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-4 border-b p-4 last:border-b-0 sm:p-5"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {user.name || "Unnamed user"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
                <p className="mt-1 text-xs text-muted-foreground capitalize">
                  {user.role}
                  {user.isBlocked ? " · Blocked" : ""}
                </p>
              </div>
              {user.role === "customer" && (
                <Button
                  type="button"
                  size="sm"
                  variant={user.isBlocked ? "outline" : "destructive"}
                  disabled={busyId === user.id}
                  onClick={() => void setBlocked(user, !user.isBlocked)}
                >
                  {user.isBlocked ? (
                    <>
                      <CircleCheck />
                      Unblock
                    </>
                  ) : (
                    <>
                      <Ban />
                      Block
                    </>
                  )}
                </Button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
