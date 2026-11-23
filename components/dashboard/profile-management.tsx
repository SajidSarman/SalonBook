"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { isHttpImageUrl, uploadImage } from "@/lib/upload-image"
import { useToast } from "@/components/ui/use-toast"

function initialsFor(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  )
}

export function ProfileManagement({
  name,
  email,
  image,
  phone,
}: {
  name: string
  email: string
  image?: string | null
  phone?: string | null
}) {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [displayName, setDisplayName] = React.useState(name)
  const [phoneNumber, setPhoneNumber] = React.useState(phone ?? "")
  const [avatar, setAvatar] = React.useState(image ?? "")
  const [imageUrlDraft, setImageUrlDraft] = React.useState("")
  const [uploading, setUploading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const url = await uploadImage(file, "profile")
      setAvatar(url)
      success("Image uploaded. Save your profile to apply it.")
    } catch (uploadError) {
      showError(
        "Could not upload image",
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload the image."
      )
    } finally {
      setUploading(false)
    }
  }

  function applyImageUrl() {
    const value = imageUrlDraft.trim()

    if (!value) {
      showError("Missing image URL", "Paste an image URL first.")
      return
    }

    if (!isHttpImageUrl(value)) {
      showError("Invalid image URL", "Enter a valid http(s) image URL.")
      return
    }

    setAvatar(value)
    setImageUrlDraft("")
    success("Image URL added. Save your profile to apply it.")
  }

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const trimmedPhone = phoneNumber.trim()

    if (trimmedPhone && !/^[+()\d\s-]{5,20}$/.test(trimmedPhone)) {
      setSaving(false)
      showError("Invalid phone number", "Enter a valid phone number (5–20 digits).")
      return
    }

    try {
      // Only self-service fields are sent. `role` and `isBlocked` are declared
      // with `input: false` in the auth config, so Better Auth rejects them.
      const result = await authClient.updateUser(
        {
          name: displayName.trim(),
          image: avatar.trim(),
          phone: trimmedPhone,
        } as Parameters<typeof authClient.updateUser>[0]
      )
      if (result.error) {
        throw new Error(
          result.error.message || "Could not update your profile."
        )
      }
      success("Profile updated.")
      router.refresh()
    } catch (requestError) {
      showError(
        "Could not update profile",
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
        <>
          {showError("Error", error)}
        </>
      )}
      <form
        onSubmit={(event) => void updateProfile(event)}
        className="grid max-w-xl gap-5 rounded-2xl border bg-card p-5"
      >
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="size-20">
            {avatar.trim() && <AvatarImage src={avatar.trim()} alt="" />}
            <AvatarFallback className="text-lg">
              {initialsFor(displayName || name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => void handleFile(event)}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading || saving}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
              {uploading ? "Uploading…" : "Upload image"}
            </Button>
            {avatar.trim() && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={uploading || saving}
                onClick={() => {
                  setAvatar("")
                }}
              >
                <Trash2 />
                Remove
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-1.5 text-sm">
          <label htmlFor="profile-image-url">Or use an image URL</label>
          <div className="flex gap-2">
            <input
              id="profile-image-url"
              type="url"
              value={imageUrlDraft}
              onChange={(event) => setImageUrlDraft(event.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="h-10 min-w-0 flex-1 rounded-lg border bg-background px-3"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-10"
              disabled={saving}
              onClick={applyImageUrl}
            >
              Use URL
            </Button>
          </div>
        </div>

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
          Phone number
          <input
            type="tel"
            maxLength={20}
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="+880 1700 000000"
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
            Email and role changes require a separate verification flow.
          </span>
        </label>
        <div>
          <Button type="submit" disabled={saving || uploading || !displayName.trim()}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </section>
  )
}
