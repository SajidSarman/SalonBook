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
import { validatePassword } from "@/lib/password"
import { FaGoogle } from "react-icons/fa"

function validateImageUrl(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "Photo URL must start with http:// or https://."
    }
    return null
  } catch {
    return "Enter a valid photo URL."
  }
}

export function SignUpForm() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim()) {
      toast.add({
        type: "error",
        title: "Missing name",
        description: "Please enter your full name.",
      })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.add({
        type: "error",
        title: "Invalid email",
        description: "Please enter a valid email address.",
      })
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      toast.add({
        type: "error",
        title: "Invalid password",
        description: passwordError,
      })
      return
    }

    let image: string | undefined
    if (imageUrl.trim()) {
      const imageError = validateImageUrl(imageUrl.trim())
      if (imageError) {
        toast.add({
          type: "error",
          title: "Invalid photo URL",
          description: imageError,
        })
        return
      }
      image = imageUrl.trim()
    }

    setLoading(true)

    const { data, error } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      image,
    })

    if (error) {
      setLoading(false)
      toast.add({
        type: "error",
        title: "Could not create account",
        description: error.message || "Please try again.",
      })
      return
    }

    toast.add({
      type: "success",
      title: "Account created",
      description: "Redirecting to your dashboard…",
    })

    setTimeout(() => {
      router.push(getDashboardPath(data?.user))
      router.refresh()
    }, 700)
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/auth/callback",
      errorCallbackURL: "/sign-up",
    })

    if (error) {
      setGoogleLoading(false)
      toast.add({
        type: "error",
        title: "Google sign up failed",
        description: error.message || "Please try again.",
      })
    }
  }

  const busy = loading || googleLoading

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={busy}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="imageUrl">Photo URL</Label>
        <Input
          id="imageUrl"
          type="url"
          placeholder="https://example.com/photo.jpg"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          disabled={busy}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="jane@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
          required
        />
        <p className="text-xs text-muted-foreground">
          Use at least 6 characters, including uppercase and lowercase letters.
        </p>
      </div>

      <Button
        type="submit"
        disabled={busy}
        className="h-9 w-full rounded-full bg-white text-zinc-950 hover:bg-white/90"
      >
        {loading ? <Spinner className="size-4" /> : null}
        Register
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>OR</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        onClick={handleGoogleSignUp}
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

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Login
        </Link>
      </p>
    </form>
  )
}
