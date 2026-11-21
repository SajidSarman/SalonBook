"use client"

import * as React from "react"
import { Pencil, Plus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"

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
  status: ServiceStatus
}

const emptyDraft: Draft = {
  serviceName: "",
  category: "",
  description: "",
  price: "",
  duration: "",
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
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)

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

  function editService(service: Service) {
    setEditingId(service.id)
    setDraft({
      serviceName: service.serviceName,
      category: service.category,
      description: service.description,
      price: String(service.price),
      duration: String(service.duration),
      status: service.status,
    })
    setError(null)
    setNotice(null)
  }

  function clearDraft() {
    setEditingId(null)
    setDraft(emptyDraft)
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
      status: draft.status,
    }

    try {
      const response = await fetch(
        editingId && editingId !== "new"
          ? `/api/admin/services/${encodeURIComponent(editingId)}`
          : "/api/admin/services",
        {
          method: editingId && editingId !== "new" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      const result: unknown = await response.json()
      if (!response.ok) {
        throw new Error(errorMessage(result, "Could not save service."))
      }
      await loadServices()
      const wasEditing = editingId !== "new"
      clearDraft()
      setNotice(wasEditing ? "Service updated." : "Service created.")
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
      if (editingId === service.id) clearDraft()
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
        {!editingId && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraft(emptyDraft)
              setEditingId("new")
              setError(null)
              setNotice(null)
            }}
          >
            <Plus />
            Add service
          </Button>
        )}
      </div>

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

      {editingId && (
        <form
          onSubmit={(event) => void saveService(event)}
          className="mb-6 grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2"
        >
          <h3 className="font-heading text-lg font-semibold sm:col-span-2">
            {editingId === "new" ? "Add service" : "Update service"}
          </h3>
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
          <p className="self-end text-sm text-muted-foreground">
            Image upload is not configured yet. New services use the existing
            fallback image; editing preserves the current image.
          </p>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save service"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={clearDraft}
            >
              <X />
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading services…</p>
      ) : services.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
          No services found.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border">
          {services.map((service) => (
            <article
              key={service.id}
              className="flex flex-wrap items-center justify-between gap-4 border-b p-4 last:border-b-0 sm:p-5"
            >
              <div className="min-w-0">
                <p className="font-medium">{service.serviceName}</p>
                <p className="text-sm text-muted-foreground">
                  {service.category} · {service.price} · {service.duration} min
                </p>
                <p className="mt-1 text-xs text-muted-foreground capitalize">
                  {service.status}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => editService(service)}
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
    </section>
  )
}
