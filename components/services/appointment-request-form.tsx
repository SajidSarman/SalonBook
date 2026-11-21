"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarClock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { authClient } from "@/lib/auth-client"
import type { SalonService } from "@/lib/services"

export function AppointmentRequestForm({ service }: { service: SalonService }) {
  const { data: session, isPending } = authClient.useSession()
  const [appointmentDate, setAppointmentDate] = React.useState("")
  const [timeSlot, setTimeSlot] = React.useState("")
  const [availableSlots, setAvailableSlots] = React.useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = React.useState(false)
  const [additionalMessage, setAdditionalMessage] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [submitted, setSubmitted] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)
  const slotRequestId = React.useRef(0)

  const role =
    session?.user && "role" in session.user ? session.user.role : undefined

  function formatTimeSlot(slot: string) {
    const [hour, minute] = slot.split(":").map(Number)
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`
  }

  async function loadAvailableSlots(date: string) {
    const requestId = ++slotRequestId.current
    setAvailableSlots([])
    setTimeSlot("")
    setError(null)

    if (!date) {
      setLoadingSlots(false)
      return
    }

    setLoadingSlots(true)
    try {
      const response = await fetch(
        `/api/appointments/available-slots?date=${encodeURIComponent(date)}`,
        { cache: "no-store" }
      )
      const result: unknown = await response.json()

      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "message" in result &&
          typeof result.message === "string"
            ? result.message
            : "Could not load available time slots."
        throw new Error(message)
      }
      if (
        !Array.isArray(result) ||
        !result.every((slot) => typeof slot === "string")
      ) {
        throw new Error("The appointment service returned invalid time slots.")
      }

      if (requestId === slotRequestId.current) {
        setAvailableSlots(result)
      }
    } catch (requestError) {
      if (requestId === slotRequestId.current) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load available time slots."
        )
      }
    } finally {
      if (requestId === slotRequestId.current) {
        setLoadingSlots(false)
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          appointmentDate,
          timeSlot,
          additionalMessage,
        }),
      })
      const result: unknown = await response.json()

      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "message" in result &&
          typeof result.message === "string"
            ? result.message
            : "Could not submit your appointment request."
        throw new Error(message)
      }

      setSubmitted(true)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not submit your appointment request."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border bg-card p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <CalendarClock className="size-5" />
        </span>
        <div>
          <h2 className="font-heading text-xl font-semibold">
            Request an appointment
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a preferred date and time. The salon will confirm your
            request.
          </p>
        </div>
      </div>

      {!formOpen && !submitted && (
        <Button
          type="button"
          className="mt-6 rounded-full"
          onClick={() => setFormOpen(true)}
        >
          Book appointment
        </Button>
      )}

      {formOpen && (
        <>
          {isPending ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Checking your account…
            </p>
          ) : !session?.user ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                render={<Link href="/sign-in" />}
                nativeButton={false}
                className="rounded-full"
              >
                Sign in to book
              </Button>
              <p className="text-sm text-muted-foreground">
                You need a customer account to request an appointment.
              </p>
            </div>
          ) : role !== "customer" ? (
            <p className="mt-6 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
              Admin accounts cannot submit customer appointment requests.
            </p>
          ) : submitted ? (
            <p className="mt-6 rounded-xl bg-muted p-4 text-sm">
              Your appointment request was sent. The salon will confirm it with
              you.
            </p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appointment-date">Appointment date</Label>
                  <Input
                    id="appointment-date"
                    type="date"
                    value={appointmentDate}
                    onChange={(event) => {
                      const date = event.target.value
                      setAppointmentDate(date)
                      void loadAvailableSlots(date)
                    }}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment-time">Available time slot</Label>
                  <select
                    id="appointment-time"
                    value={timeSlot}
                    onChange={(event) => setTimeSlot(event.target.value)}
                    required
                    disabled={submitting}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="" disabled>
                      {loadingSlots ? "Loading slots…" : "Select a time"}
                    </option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {formatTimeSlot(slot)}
                      </option>
                    ))}
                  </select>
                  {!loadingSlots &&
                    appointmentDate &&
                    availableSlots.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No time slots are available on this date.
                      </p>
                    )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment-message">
                  Additional message{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="appointment-message"
                  value={additionalMessage}
                  onChange={(event) => setAdditionalMessage(event.target.value)}
                  maxLength={1000}
                  placeholder="Anything you would like the salon to know?"
                  disabled={submitting}
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full rounded-full sm:w-auto"
                disabled={
                  submitting ||
                  loadingSlots ||
                  !appointmentDate ||
                  !timeSlot ||
                  !availableSlots.includes(timeSlot)
                }
              >
                {submitting ? "Sending request…" : "Request appointment"}
              </Button>
            </form>
          )}
        </>
      )}
    </section>
  )
}
