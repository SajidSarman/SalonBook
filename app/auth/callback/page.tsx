"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { getDashboardPath } from "@/lib/auth-redirect"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    const completeSignIn = async () => {
      const { data, error: sessionError } = await authClient.getSession()

      if (!active) return

      if (sessionError || !data?.user) {
        setError("We couldn't complete your sign in. Please try again.")
        return
      }

      router.replace(getDashboardPath(data.user))
      router.refresh()
    }

    void completeSignIn()

    return () => {
      active = false
    }
  }, [router])

  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-background px-6 text-foreground">
      {error ? (
        <div className="max-w-sm text-center">
          <p className="font-heading text-2xl font-semibold">
            Sign in failed
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link
            href="/sign-in"
            className="mt-4 inline-flex text-sm font-medium underline underline-offset-4"
          >
            Back to log in
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Spinner />
          Completing sign in…
        </div>
      )}
    </main>
  )
}
