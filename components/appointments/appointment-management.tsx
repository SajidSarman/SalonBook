"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { CalendarClock, CreditCard } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

type AppointmentStatus = "Pending" | "Confirmed" | "Cancelled"
type ManagementRole = "customer" | "admin"

type Appointment = {
  id: string
  serviceName: string
  serviceCategory: string
  serviceImage: string | null
  customerName: string
  customerEmail: string
  appointmentDate: string
  timeSlot: string
  additionalMessage: string
  servicePrice: number | null
  createdAt: string | null
  status: AppointmentStatus
  paymentStatus: "Unpaid" | "Paid"
}

const statusSections: {
  status: AppointmentStatus
  description: string
  dot: string
  badge: string
}[] = [
  {
    status: "Pending",
    description: "Waiting for confirmation",
    dot: "bg-amber-500",
    badge:
      "border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-200",
  },
  {
    status: "Confirmed",
    description: "Scheduled and confirmed",
    dot: "bg-emerald-500",
    badge:
      "border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-200",
  },
  {
    status: "Cancelled",
    description: "No longer active",
    dot: "bg-rose-500",
    badge:
      "border-rose-200 bg-rose-100 text-rose-900 dark:border-rose-400/30 dark:bg-rose-400/15 dark:text-rose-200",
  },
]

function parseAppointments(value: unknown): Appointment[] {
  if (!Array.isArray(value)) {
    throw new Error("The appointment service returned an invalid response.")
  }

  return value.map((item) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(
        "The appointment service returned an invalid appointment."
      )
    }

    const appointment = item as Record<string, unknown>
    const id =
      typeof appointment._id === "string"
        ? appointment._id
        : typeof appointment.id === "string"
          ? appointment.id
          : null

    if (
      !id ||
      typeof appointment.serviceName !== "string" ||
      (appointment.serviceCategory !== undefined &&
        typeof appointment.serviceCategory !== "string") ||
      (appointment.serviceImage !== undefined &&
        appointment.serviceImage !== null &&
        typeof appointment.serviceImage !== "string") ||
      typeof appointment.customerName !== "string" ||
      typeof appointment.customerEmail !== "string" ||
      typeof appointment.appointmentDate !== "string" ||
      typeof appointment.timeSlot !== "string" ||
      (appointment.servicePrice !== undefined &&
        (typeof appointment.servicePrice !== "number" ||
          !Number.isFinite(appointment.servicePrice))) ||
      (appointment.createdAt !== undefined &&
        typeof appointment.createdAt !== "string") ||
      (appointment.status !== "Pending" &&
        appointment.status !== "Confirmed" &&
        appointment.status !== "Cancelled") ||
      (appointment.paymentStatus !== "Unpaid" &&
        appointment.paymentStatus !== "Paid")
    ) {
      throw new Error(
        "The appointment service returned invalid appointment fields."
      )
    }

    return {
      id,
      serviceName: appointment.serviceName,
      serviceCategory:
        typeof appointment.serviceCategory === "string"
          ? appointment.serviceCategory
          : "",
      serviceImage:
        typeof appointment.serviceImage === "string"
          ? appointment.serviceImage
          : null,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot,
      additionalMessage:
        typeof appointment.additionalMessage === "string"
          ? appointment.additionalMessage
          : "",
      servicePrice:
        typeof appointment.servicePrice === "number"
          ? appointment.servicePrice
          : null,
      createdAt:
        typeof appointment.createdAt === "string"
          ? appointment.createdAt
          : null,
      status: appointment.status,
      paymentStatus: appointment.paymentStatus,
    }
  })
}

function displayTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  const date = new Date(2000, 0, 1, hours, minutes)
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(value)
}

function AppointmentCard({
  appointment,
  role,
  busy,
  onUpdate,
}: {
  appointment: Appointment
  role: ManagementRole
  busy: boolean
  onUpdate: (status: "Confirmed" | "Cancelled") => void
}) {
  const statusStyle =
    statusSections.find((section) => section.status === appointment.status) ??
    statusSections[0]

  return (
    <article className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <Image
            src={appointment.serviceImage || "/auth-image.jpg"}
            alt={appointment.serviceName}
            width={96}
            height={96}
            unoptimized
            className="size-20 shrink-0 rounded-xl object-cover sm:size-24"
          />
          <div className="min-w-0">
            <h3 className="font-heading text-lg font-semibold">
              {appointment.serviceName}
            </h3>
            {appointment.serviceCategory && (
              <p className="mt-1 text-sm text-muted-foreground">
                {appointment.serviceCategory}
              </p>
            )}
            {appointment.servicePrice !== null && (
              <p className="mt-1 text-sm font-medium">
                Service price: {formatPrice(appointment.servicePrice)}
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(
                `${appointment.appointmentDate}T00:00:00`
              ).toLocaleDateString()}{" "}
              · {displayTime(appointment.timeSlot)}
            </p>
            {appointment.createdAt && (
              <p className="mt-1 text-sm text-muted-foreground">
                Booking requested:{" "}
                {new Date(appointment.createdAt).toLocaleString()}
              </p>
            )}
            {role === "admin" && (
              <p className="mt-2 text-sm text-muted-foreground">
                {appointment.customerName} · {appointment.customerEmail}
              </p>
            )}
            {appointment.additionalMessage && (
              <p className="mt-3 text-sm">“{appointment.additionalMessage}”</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={statusStyle.badge}>
            <span
              aria-hidden="true"
              className={cn("size-1.5 rounded-full", statusStyle.dot)}
            />
            {appointment.status}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              appointment.paymentStatus === "Paid" &&
                "border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-200"
            )}
          >
            Payment: {appointment.paymentStatus}
          </Badge>
        </div>
      </div>

      {role === "admin" && appointment.status === "Pending" && (
        <div className="mt-5 flex gap-2 border-t pt-4">
          <Button size="sm" disabled={busy} onClick={() => onUpdate("Confirmed")}>
            Confirm
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onUpdate("Cancelled")}
          >
            Cancel
          </Button>
        </div>
      )}
      {role === "admin" && appointment.status === "Confirmed" && (
        <div className="mt-5 border-t pt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onUpdate("Cancelled")}
          >
            Cancel appointment
          </Button>
        </div>
      )}
      {role === "customer" && appointment.status === "Pending" && (
        <div className="mt-5 border-t pt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onUpdate("Cancelled")}
          >
            Cancel request
          </Button>
        </div>
      )}
      {role === "customer" &&
        appointment.status === "Confirmed" &&
        appointment.paymentStatus === "Unpaid" && (
          <div className="mt-5 border-t pt-4">
            <Button
              render={
                <Link
                  href={`/dashboard/customer/appointments/${encodeURIComponent(appointment.id)}/checkout`}
                />
              }
              nativeButton={false}
              size="sm"
            >
              <CreditCard />
              Pay for appointment
            </Button>
          </div>
        )}
      {role === "customer" && appointment.status === "Pending" && (
        <div className="mt-5 border-t pt-4">
          <Button size="sm" disabled>
            <CreditCard />
            Pay after confirmation
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Payment becomes available after an admin confirms this appointment.
          </p>
        </div>
      )}
      {role === "customer" &&
        appointment.status === "Confirmed" &&
        appointment.paymentStatus === "Paid" && (
          <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">
            Payment completed.
          </p>
        )}
    </article>
  )
}

export function AppointmentManagement({ role }: { role: ManagementRole }) {
  const { success, error: showError } = useToast()
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const endpoint =
    role === "admin" ? "/api/admin/appointments" : "/api/appointments"
  const customerMetrics = [
    { label: "Total requests", count: appointments.length },
    {
      label: "Pending",
      count: appointments.filter((item) => item.status === "Pending").length,
    },
    {
      label: "Confirmed",
      count: appointments.filter((item) => item.status === "Confirmed").length,
    },
    {
      label: "Cancelled",
      count: appointments.filter((item) => item.status === "Cancelled").length,
    },
  ]

  React.useEffect(() => {
    let active = true

    async function loadAppointments() {
      try {
        const response = await fetch(endpoint, { cache: "no-store" })
        const result: unknown = await response.json()

        if (!response.ok) {
          const message =
            typeof result === "object" &&
            result !== null &&
            "message" in result &&
            typeof result.message === "string"
              ? result.message
              : "Could not load appointments."
          throw new Error(message)
        }

        const data = parseAppointments(result)
        if (active) {
          setAppointments(data)
        }
      } catch (requestError) {
        if (active) {
          showError(
            "Could not load appointments",
            requestError instanceof Error
              ? requestError.message
              : "Could not load appointments."
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadAppointments()
    return () => {
      active = false
    }
  }, [endpoint, showError])

  async function updateAppointment(
    appointment: Appointment,
    status: "Confirmed" | "Cancelled"
  ) {
    setBusyId(appointment.id)
    setError(null)

    try {
      const response = await fetch(
        role === "admin"
          ? `/api/admin/appointments/${encodeURIComponent(appointment.id)}`
          : `/api/appointments/${encodeURIComponent(appointment.id)}/cancel`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          ...(role === "admin" ? { body: JSON.stringify({ status }) } : {}),
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
            : "Could not update appointment."
        throw new Error(message)
      }

      setAppointments((current) =>
        current.map((item) =>
          item.id === appointment.id ? { ...item, status } : item
        )
      )
      success(
        status === "Confirmed"
          ? "Appointment confirmed."
          : "Appointment cancelled."
      )
    } catch (requestError) {
      showError(
        "Could not update appointment",
        requestError instanceof Error
          ? requestError.message
          : "Could not update appointment."
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      {role === "customer" && (
        <section
          id="customer-overview"
          className="mt-8 scroll-mt-24"
          aria-labelledby="customer-overview-title"
        >
          <h2
            id="customer-overview-title"
            className="mb-4 font-heading text-2xl font-semibold"
          >
            Dashboard Overview
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {customerMetrics.map(({ label, count }) => (
              <article key={label} className="rounded-2xl border bg-card p-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-semibold">
                  {loading || error ? "—" : count.toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
      <section id="appointment-management-title" className="mt-10 scroll-mt-24">
        <div className="mb-5 flex items-center gap-3">
          <CalendarClock className="size-5" />
          <h2 className="font-heading text-2xl font-semibold">
            {role === "admin" ? "Appointment requests" : "My Appointments"}
          </h2>
        </div>

        {error && (
          <>
            {showError("Error", error)}
          </>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading appointments…</p>
        ) : appointments.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
            No appointment requests yet.
          </p>
        ) : (
          <div className="grid gap-10">
            {statusSections.map(({ status, description, dot, badge }) => {
              const items = appointments.filter(
                (appointment) => appointment.status === status
              )

              if (items.length === 0) return null

              return (
                <section
                  key={status}
                  aria-labelledby={`appointments-${status.toLowerCase()}`}
                  className="scroll-mt-24"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={cn("size-2.5 rounded-full", dot)}
                    />
                    <h3
                      id={`appointments-${status.toLowerCase()}`}
                      className="font-heading text-lg font-semibold"
                    >
                      {status}
                    </h3>
                    <Badge variant="outline" className={badge}>
                      {items.length}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {description}
                    </span>
                  </div>
                  <div className="grid gap-4">
                    {items.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        role={role}
                        busy={busyId === appointment.id}
                        onUpdate={(nextStatus) =>
                          void updateAppointment(appointment, nextStatus)
                        }
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
