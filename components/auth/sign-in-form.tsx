"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"
import { getDashboardPath } from "@/lib/auth-redirect"
import { FaGoogle } from "react-icons/fa";

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password) {
      toast.add({
        type: "error",
        title: "Missing details",
        description: "Please enter your email and password.",
      })
      return
    }

    setLoading(true)

    const { data, error } = await authClient.signIn.email({
      email: email.trim(),
      password,
    })

    if (error) {
      setLoading(false)
      toast.add({
        type: "error",
        title: "Could not sign in",
        description: error.message || "Please check your details and try again.",
      })
      return
    }

    toast.add({
      type: "success",
      title: "Signed in",
      description: "Redirecting to your dashboard…",
    })

    setTimeout(() => {
      router.push(getDashboardPath(data?.user))
      router.refresh()
    }, 700)
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/auth/callback",
      errorCallbackURL: "/sign-in",
    })

    if (error) {
      setGoogleLoading(false)
      toast.add({
        type: "error",
        title: "Google sign in failed",
        description: error.message || "Please try again.",
      })
    }
  }

  const busy = loading || googleLoading

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>


      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
          required
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="#"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={busy}
        className="h-9 w-full rounded-full bg-white text-zinc-950 hover:bg-white/90"
      >
        {loading ? <Spinner className="size-4" /> : null}
        Log in
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Create account
        </Link>
      </p>
      
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>OR</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={busy}
        className="h-9 w-full rounded-full bg-white text-zinc-950 hover:bg-white/90"
      >
        {googleLoading ? (
          <Spinner className="size-4" />
        ) : (
          <FaGoogle />
        )}
        Continue with Google
      </Button>
      
    </form>
  )
}
