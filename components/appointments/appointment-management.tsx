"use client"

import * as React from "react"
import { CalendarClock } from "lucide-react"

import { Button } from "@/components/ui/button"

type AppointmentStatus = "Pending" | "Confirmed" | "Cancelled"
type ManagementRole = "customer" | "admin"

type Appointment = {
  id: string
  serviceName: string
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

export function AppointmentManagement({ role }: { role: ManagementRole }) {
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)

  const endpoint =
    role === "admin" ? "/api/admin/appointments" : "/api/appointments"

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
          setError(
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
  }, [endpoint])

  async function updateAppointment(
    appointment: Appointment,
    status: "Confirmed" | "Cancelled"
  ) {
    setBusyId(appointment.id)
    setError(null)
    setNotice(null)

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
      setNotice(
        status === "Confirmed"
          ? "Appointment confirmed."
          : "Appointment cancelled."
      )
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update appointment."
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section id="appointment-management-title" className="mt-10 scroll-mt-24">
      <div className="mb-5 flex items-center gap-3">
        <CalendarClock className="size-5" />
        <h2 className="font-heading text-2xl font-semibold">
          {role === "admin" ? "Appointment requests" : "Your appointments"}
        </h2>
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

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading appointments…</p>
      ) : appointments.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
          No appointment requests yet.
        </p>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <article
              key={appointment.id}
              className="rounded-2xl border bg-card p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading text-lg font-semibold">
                    {appointment.serviceName}
                  </h3>
                  {appointment.servicePrice !== null && (
                    <p className="mt-1 text-sm font-medium">
                      Service price:{" "}
                      {new Intl.NumberFormat("en-BD", {
                        style: "currency",
                        currency: "BDT",
                        maximumFractionDigits: 2,
                      }).format(appointment.servicePrice)}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(
                      `${appointment.appointmentDate}T00:00:00`
                    ).toLocaleDateString()}{" "}
                    · {displayTime(appointment.timeSlot)}
                  </p>
                  {role === "admin" && appointment.createdAt && (
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
                    <p className="mt-3 text-sm">
                      “{appointment.additionalMessage}”
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-muted px-3 py-1">
                    {appointment.status}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1">
                    Payment: {appointment.paymentStatus}
                  </span>
                </div>
              </div>

              {role === "admin" && appointment.status === "Pending" && (
                <div className="mt-5 flex gap-2 border-t pt-4">
                  <Button
                    size="sm"
                    disabled={busyId === appointment.id}
                    onClick={() =>
                      void updateAppointment(appointment, "Confirmed")
                    }
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === appointment.id}
                    onClick={() =>
                      void updateAppointment(appointment, "Cancelled")
                    }
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
                    disabled={busyId === appointment.id}
                    onClick={() =>
                      void updateAppointment(appointment, "Cancelled")
                    }
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
                    disabled={busyId === appointment.id}
                    onClick={() =>
                      void updateAppointment(appointment, "Cancelled")
                    }
                  >
                    Cancel request
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
