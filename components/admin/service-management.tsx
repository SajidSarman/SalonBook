"use client"

import * as React from "react"
import Image from "next/image"
import {
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { uploadImage } from "@/lib/upload-image"

type ServiceStatus = "active" | "inactive"
type Service = {
  id: string
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string | null
  status: ServiceStatus
}
type Draft = {
  serviceName: string
  category: string
  description: string
  price: string
  duration: string
  image: string
  status: ServiceStatus
}
type SortOrder = "newest" | "price-low" | "price-high" | "name"

const emptyDraft: Draft = {
  serviceName: "",
  category: "",
  description: "",
  price: "",
  duration: "",
  image: "",
  status: "active",
}

function parseServices(value: unknown): Service[] {
  if (!Array.isArray(value)) {
    throw new Error("The services API returned an invalid response.")
  }

  return value.map((item) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("The services API returned an invalid service.")
    }
    const service = item as Record<string, unknown>
    const id =
      typeof service._id === "string"
        ? service._id
        : typeof service.id === "string"
          ? service.id
          : null
    if (
      !id ||
      typeof service.serviceName !== "string" ||
      typeof service.category !== "string" ||
      typeof service.description !== "string" ||
      typeof service.price !== "number" ||
      typeof service.duration !== "number" ||
      (service.status !== "active" && service.status !== "inactive")
    ) {
      throw new Error("The services API returned invalid service fields.")
    }
    return {
      id,
      serviceName: service.serviceName,
      category: service.category,
      description: service.description,
      price: service.price,
      duration: service.duration,
      image: typeof service.image === "string" ? service.image : null,
      status: service.status,
    }
  })
}

function errorMessage(value: unknown, fallback: string) {
  return typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
    ? value.message
    : fallback
}

export function ServiceManagement() {
  const [services, setServices] = React.useState<Service[]>([])
  const [draft, setDraft] = React.useState<Draft>(emptyDraft)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("newest")
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const loadServices = React.useCallback(async () => {
    const response = await fetch("/api/admin/services", { cache: "no-store" })
    const result: unknown = await response.json()
    if (!response.ok) {
      throw new Error(errorMessage(result, "Could not load services."))
    }
    setServices(parseServices(result))
  }, [])

  React.useEffect(() => {
    let active = true
    async function load() {
      try {
        await loadServices()
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load services."
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [loadServices])

  const visibleServices = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    const matches = services.filter(
      (service) =>
        !query ||
        service.serviceName.toLocaleLowerCase().includes(query) ||
        service.category.toLocaleLowerCase().includes(query)
    )

    if (sortOrder === "price-low") {
      return [...matches].sort((a, b) => a.price - b.price)
    }
    if (sortOrder === "price-high") {
      return [...matches].sort((a, b) => b.price - a.price)
    }
    if (sortOrder === "name") {
      return [...matches].sort((a, b) =>
        a.serviceName.localeCompare(b.serviceName)
      )
    }
    return matches
  }, [search, services, sortOrder])

  function openCreate() {
    setEditingId(null)
    setDraft(emptyDraft)
    setError(null)
    setNotice(null)
    setDialogOpen(true)
  }

  function openEdit(service: Service) {
    setEditingId(service.id)
    setDraft({
      serviceName: service.serviceName,
      category: service.category,
      description: service.description,
      price: String(service.price),
      duration: String(service.duration),
      image: service.image ?? "",
      status: service.status,
    })
    setError(null)
    setNotice(null)
    setDialogOpen(true)
  }

  function closeDialog() {
    if (saving || uploading) return
    setDialogOpen(false)
    setEditingId(null)
    setDraft(emptyDraft)
  }

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const url = await uploadImage(file, "service")
      setDraft((current) => ({ ...current, image: url }))
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload the image."
      )
    } finally {
      setUploading(false)
    }
  }

  async function saveService(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setNotice(null)

    const payload = {
      serviceName: draft.serviceName.trim(),
      category: draft.category.trim(),
      description: draft.description.trim(),
      price: Number(draft.price),
      duration: Number(draft.duration),
      image: draft.image.trim() || null,
      status: draft.status,
    }

    try {
      const response = await fetch(
        editingId
          ? `/api/admin/services/${encodeURIComponent(editingId)}`
          : "/api/admin/services",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      const result: unknown = await response.json()
      if (!response.ok) {
        throw new Error(errorMessage(result, "Could not save service."))
      }
      await loadServices()
      setDialogOpen(false)
      setEditingId(null)
      setDraft(emptyDraft)
      setNotice(editingId ? "Service updated." : "Service created.")
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not save service."
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteService(service: Service) {
    if (!window.confirm(`Delete "${service.serviceName}"?`)) return
    setError(null)
    setNotice(null)
    try {
      const response = await fetch(
        `/api/admin/services/${encodeURIComponent(service.id)}`,
        { method: "DELETE" }
      )
      const result: unknown = await response.json()
      if (!response.ok) {
        throw new Error(errorMessage(result, "Could not delete service."))
      }
      setServices((current) => current.filter((item) => item.id !== service.id))
      setNotice("Service deleted.")
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not delete service."
      )
    }
  }

  return (
    <section className="mt-12" aria-labelledby="service-management-title">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="service-management-title"
          className="font-heading text-2xl font-semibold"
        >
          Manage services
        </h2>
        <Button type="button" variant="outline" onClick={openCreate}>
          <Plus />
          Add service
        </Button>
      </div>

      {error && !dialogOpen && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {notice && !dialogOpen && (
        <p role="status" className="mb-4 rounded-xl bg-muted p-4 text-sm">
          {notice}
        </p>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.5fr)]">
        <label className="relative block">
          <span className="sr-only">Search services by name</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search services by name"
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="sr-only">Sort services</span>
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading services…</p>
      ) : services.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
          No services found.
        </p>
      ) : visibleServices.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
          No services match “{search}”.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border">
          {visibleServices.map((service) => (
            <article
              key={service.id}
              className="flex flex-wrap items-center justify-between gap-4 border-b p-4 last:border-b-0 sm:p-5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <Image
                  src={service.image || "/auth-image.jpg"}
                  alt={service.serviceName}
                  width={64}
                  height={64}
                  unoptimized
                  className="size-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="font-medium">{service.serviceName}</p>
                  <p className="text-sm text-muted-foreground">
                    {service.category} ·{" "}
                    {new Intl.NumberFormat("en-BD", {
                      style: "currency",
                      currency: "BDT",
                      maximumFractionDigits: 0,
                    }).format(service.price)}{" "}
                    · {service.duration} min
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground capitalize">
                    {service.status}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(service)}
                >
                  <Pencil />
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => void deleteService(service)}
                >
                  <Trash2 />
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Update service" : "Add service"}
            </DialogTitle>
            <DialogDescription>
              Service images are uploaded to imgbb. JPEG, PNG, WebP or GIF up
              to 5 MB.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(event) => void saveService(event)}
            className="grid gap-4 sm:grid-cols-2"
          >
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive sm:col-span-2"
              >
                {error}
              </p>
            )}

            <div className="grid gap-2 sm:col-span-2">
              <span className="text-sm">Service image</span>
              <div className="flex flex-wrap items-center gap-3">
                {draft.image ? (
                  <Image
                    src={draft.image}
                    alt="Selected service image"
                    width={80}
                    height={80}
                    unoptimized
                    className="size-20 rounded-xl border object-cover"
                  />
                ) : (
                  <div className="grid size-20 place-items-center rounded-xl border border-dashed text-xs text-muted-foreground">
                    No image
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(event) => void handleImage(event)}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={uploading || saving}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ImagePlus />
                  )}
                  {uploading
                    ? "Uploading…"
                    : draft.image
                      ? "Replace image"
                      : "Upload image"}
                </Button>
                {draft.image && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={uploading || saving}
                    onClick={() => setDraft({ ...draft, image: "" })}
                  >
                    <X />
                    Remove
                  </Button>
                )}
              </div>
            </div>

            <label className="grid gap-1.5 text-sm">
              Service name
              <input
                required
                maxLength={120}
                value={draft.serviceName}
                onChange={(event) =>
                  setDraft({ ...draft, serviceName: event.target.value })
                }
                className="h-10 rounded-lg border bg-background px-3"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              Service category
              <input
                required
                maxLength={80}
                value={draft.category}
                onChange={(event) =>
                  setDraft({ ...draft, category: event.target.value })
                }
                className="h-10 rounded-lg border bg-background px-3"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              Price
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={draft.price}
                onChange={(event) =>
                  setDraft({ ...draft, price: event.target.value })
                }
                className="h-10 rounded-lg border bg-background px-3"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              Estimated duration (minutes)
              <input
                required
                type="number"
                min="1"
                step="1"
                value={draft.duration}
                onChange={(event) =>
                  setDraft({ ...draft, duration: event.target.value })
                }
                className="h-10 rounded-lg border bg-background px-3"
              />
            </label>
            <label className="grid gap-1.5 text-sm sm:col-span-2">
              Description
              <textarea
                required
                maxLength={2000}
                rows={4}
                value={draft.description}
                onChange={(event) =>
                  setDraft({ ...draft, description: event.target.value })
                }
                className="rounded-lg border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              Service status
              <select
                value={draft.status}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    status: event.target.value as ServiceStatus,
                  })
                }
                className="h-10 rounded-lg border bg-background px-3"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <DialogFooter className="sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                disabled={saving || uploading}
                onClick={closeDialog}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? "Saving…" : "Save service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
