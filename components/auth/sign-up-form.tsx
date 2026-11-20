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

function validateEmail(value: string) {
  if (!value.trim()) {
    return "Please enter your email address."
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "Please enter a valid email address."
  }
  return null
}

export function SignUpForm() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [emailError, setEmailError] = React.useState<string | null>(null)
  const [password, setPassword] = React.useState("")
  const [passwordError, setPasswordError] = React.useState<string | null>(null)
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

    const emailValidation = validateEmail(email)
    const passwordValidation = validatePassword(password)
    setEmailError(emailValidation)
    setPasswordError(passwordValidation)
    // Show both field errors at once instead of one at a time.
    if (emailValidation || passwordValidation) {
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
    // console.log("signup response", data, error)

    if (error) {
      setLoading(false)

      // Email problems (bad address or already registered) belong on the
      // email field, not in a toast.
      if (
        error.code === "USER_ALREADY_EXISTS" ||
        error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
      ) {
        setEmailError(
          error.message || "An account with this email already exists."
        )
        return
      }

      // The server can reject the password independently of the client checks
      // (e.g. someone calling the API directly). Surface it on the field too.
      if (error.code === "INVALID_PASSWORD") {
        setPasswordError(
          error.message || "Password does not meet the requirements."
        )
        return
      }

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
          onChange={(event) => {
            const value = event.target.value
            setEmail(value)
            // Re-check live only after the first error, so the field doesn't
            // turn red while the user is still typing.
            if (emailError) {
              setEmailError(validateEmail(value))
            }
          }}
          disabled={busy}
          required
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? "email-error" : undefined}
        />
        {emailError ? (
          <p id="email-error" className="text-xs text-destructive">
            {emailError}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={password}
          onChange={(event) => {
            const value = event.target.value
            setPassword(value)
            // Re-check live only after the first error, so the field doesn't
            // turn red while the user is still typing a new password.
            if (passwordError) {
              setPasswordError(validatePassword(value))
            }
          }}
          disabled={busy}
          required
          aria-invalid={passwordError ? true : undefined}
          aria-describedby={
            passwordError ? "password-hint password-error" : "password-hint"
          }
        />
        <p id="password-hint" className="text-xs text-muted-foreground">
          Use at least 6 characters, including uppercase and lowercase letters.
        </p>
        {passwordError ? (
          <p id="password-error" className="text-xs text-destructive">
            {passwordError}
          </p>
        ) : null}
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
