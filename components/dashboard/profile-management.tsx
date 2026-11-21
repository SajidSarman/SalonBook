"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function ProfileManagement({
  name,
  email,
}: {
  name: string
  email: string
}) {
  const [displayName, setDisplayName] = React.useState(name)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setNotice(null)

    try {
      const result = await authClient.updateUser({
        name: displayName.trim(),
      })
      if (result.error) {
        throw new Error(
          result.error.message || "Could not update your profile."
        )
      }
      setNotice("Profile updated.")
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update your profile."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      id="profile-management-title"
      className="mt-12 scroll-mt-24"
      aria-labelledby="profile-management-heading"
    >
      <h2
        id="profile-management-heading"
        className="mb-5 font-heading text-2xl font-semibold"
      >
        My Profile
      </h2>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-4 rounded-xl bg-muted p-4 text-sm">
          {notice}
        </p>
      )}
      <form
        onSubmit={(event) => void updateProfile(event)}
        className="grid max-w-xl gap-4 rounded-2xl border bg-card p-5"
      >
        <label className="grid gap-1.5 text-sm">
          Name
          <input
            required
            maxLength={100}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="h-10 rounded-lg border bg-background px-3"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          Email
          <input
            type="email"
            value={email}
            readOnly
            className="h-10 rounded-lg border bg-muted px-3 text-muted-foreground"
          />
          <span className="text-xs text-muted-foreground">
            Email changes require a separate verification flow.
          </span>
        </label>
        <div>
          <Button type="submit" disabled={saving || !displayName.trim()}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </section>
  )
}
