"use client"

import * as React from "react"

const metrics = [
  ["totalCustomers", "Registered customers"],
  ["activeServices", "Active services"],
  ["totalAppointments", "Appointment requests"],
  ["pendingAppointments", "Pending appointments"],
  ["confirmedAppointments", "Confirmed appointments"],
] as const

type Overview = Record<(typeof metrics)[number][0], number> & {
  successfulPayments: number | null
}

function isOverview(value: unknown): value is Overview {
  if (typeof value !== "object" || value === null) return false
  const record = value as Record<string, unknown>
  return (
    metrics.every(([key]) => {
      const metric = record[key]
      return (
        typeof metric === "number" && Number.isFinite(metric) && metric >= 0
      )
    }) &&
    (record.successfulPayments === null ||
      (typeof record.successfulPayments === "number" &&
        Number.isFinite(record.successfulPayments) &&
        record.successfulPayments >= 0))
  )
}

export function AdminOverview() {
  const [overview, setOverview] = React.useState<Overview | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    async function loadOverview() {
      try {
        const response = await fetch("/api/admin/overview", {
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
              : "Could not load the admin overview."
          throw new Error(message)
        }
        if (!isOverview(result)) {
          throw new Error("The overview API returned invalid data.")
        }
        if (active) setOverview(result)
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load the admin overview."
          )
        }
      }
    }

    void loadOverview()
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="mt-8" aria-labelledby="admin-overview-title">
      <h2
        id="admin-overview-title"
        className="mb-4 font-heading text-2xl font-semibold"
      >
        Overview
      </h2>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(([key, label]) => (
          <article key={key} className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">
              {overview ? overview[key].toLocaleString() : "—"}
            </p>
          </article>
        ))}
        <article className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Successful payments</p>
          <p className="mt-2 text-xl font-semibold">
            {overview === null
              ? "—"
              : overview.successfulPayments === null
                ? "Not configured"
                : overview.successfulPayments.toLocaleString()}
          </p>
          {overview === null ? (
            !error && (
              <span
                className="mt-1 block h-4 w-40 animate-pulse rounded bg-muted"
                aria-hidden="true"
              />
            )
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              {overview.successfulPayments === null
                ? "Payment integration is pending."
                : "Paid Stripe transactions."}
            </p>
          )}
        </article>
      </div>
    </section>
  )
}
