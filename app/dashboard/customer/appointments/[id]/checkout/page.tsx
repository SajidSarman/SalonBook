import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/auth-guard"
import { proxyToExpress } from "@/lib/express-api"

type PayableAppointment = {
  serviceName: string
  serviceCategory: string
  serviceImage: string | null
  appointmentDate: string
  timeSlot: string
  servicePrice: number | null
  status: "Pending" | "Confirmed" | "Cancelled"
  paymentStatus: "Unpaid" | "Paid"
  createdAt: string | null
}

function parseAppointment(value: unknown): PayableAppointment {
  if (typeof value !== "object" || value === null) {
    throw new Error("The appointment service returned an invalid response.")
  }
  const appointment = value as Record<string, unknown>
  if (
    typeof appointment.serviceName !== "string" ||
    (appointment.serviceCategory !== undefined &&
      typeof appointment.serviceCategory !== "string") ||
    (appointment.serviceImage !== undefined &&
      appointment.serviceImage !== null &&
      typeof appointment.serviceImage !== "string") ||
    typeof appointment.appointmentDate !== "string" ||
    typeof appointment.timeSlot !== "string" ||
    (appointment.servicePrice !== undefined &&
      (typeof appointment.servicePrice !== "number" ||
        !Number.isFinite(appointment.servicePrice))) ||
    (appointment.status !== "Pending" &&
      appointment.status !== "Confirmed" &&
      appointment.status !== "Cancelled") ||
    (appointment.paymentStatus !== "Unpaid" &&
      appointment.paymentStatus !== "Paid") ||
    (appointment.createdAt !== undefined &&
      typeof appointment.createdAt !== "string")
  ) {
    throw new Error(
      "The appointment service returned invalid appointment fields."
    )
  }

  return {
    serviceName: appointment.serviceName,
    serviceCategory:
      typeof appointment.serviceCategory === "string"
        ? appointment.serviceCategory
        : "",
    serviceImage:
      typeof appointment.serviceImage === "string"
        ? appointment.serviceImage
        : null,
    appointmentDate: appointment.appointmentDate,
    timeSlot: appointment.timeSlot,
    servicePrice:
      typeof appointment.servicePrice === "number"
        ? appointment.servicePrice
        : null,
    status: appointment.status,
    paymentStatus: appointment.paymentStatus,
    createdAt:
      typeof appointment.createdAt === "string" ? appointment.createdAt : null,
  }
}

function displayTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hours, minutes))
}

const priceFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 2,
})

export default async function AppointmentPaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ canceled?: string }>
}) {
  const session = await requireRole("customer")
  const { id } = await params
  const { canceled } = await searchParams
  const response = await proxyToExpress(
    `/appointments/${encodeURIComponent(id)}?customerId=${encodeURIComponent(session.user.id)}`
  )

  if (canceled) {
    console.log(
      "Order canceled -- continue to shop around and check out when you're ready."
    )
  }

  if (response.status === 404) {
    notFound()
  }
  if (!response.ok) {
    throw new Error("Could not load this appointment.")
  }

  const appointment = parseAppointment(await response.json())
  const canPay =
    appointment.status === "Confirmed" &&
    appointment.paymentStatus === "Unpaid" &&
    appointment.servicePrice !== null &&
    appointment.servicePrice > 0

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col py-8">
      <Link
        href="/dashboard/customer#appointment-management-title"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to my appointments
      </Link>
      <h1 className="font-heading text-3xl font-semibold">Checkout</h1>
      <p className="mt-1 text-muted-foreground">
        Confirm the appointment details and payment amount.
      </p>

      <article className="mt-6 overflow-hidden rounded-2xl border bg-card">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
          <Image
            src={appointment.serviceImage || "/auth-image.jpg"}
            alt={appointment.serviceName}
            width={160}
            height={160}
            unoptimized
            className="size-32 rounded-xl object-cover sm:size-40"
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-xl font-semibold">
              {appointment.serviceName}
            </h2>
            {appointment.serviceCategory && (
              <p className="mt-1 text-sm text-muted-foreground">
                {appointment.serviceCategory}
              </p>
            )}
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Appointment</dt>
                <dd className="font-medium">
                  {new Date(
                    `${appointment.appointmentDate}T00:00:00`
                  ).toLocaleDateString()}{" "}
                  · {displayTime(appointment.timeSlot)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Appointment status</dt>
                <dd className="font-medium">{appointment.status}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Payment status</dt>
                <dd className="font-medium">{appointment.paymentStatus}</dd>
              </div>
              {appointment.createdAt && (
                <div>
                  <dt className="text-muted-foreground">Request date</dt>
                  <dd className="font-medium">
                    {new Date(appointment.createdAt).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="border-t bg-muted/30 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium">Total</span>
            <span className="text-lg font-semibold">
              {appointment.servicePrice === null
                ? "Price unavailable"
                : priceFormatter.format(appointment.servicePrice)}
            </span>
          </div>

          <div className="mt-5">
            {appointment.paymentStatus === "Paid" ? (
              <p role="status" className="text-sm text-muted-foreground">
                Payment is complete for this appointment.
              </p>
            ) : appointment.status !== "Confirmed" ? (
              <p role="status" className="text-sm text-muted-foreground">
                Checkout is available only after the appointment is confirmed.
              </p>
            ) : canPay ? (
              <form action="/api/checkout_sessions" method="POST">
                <input type="hidden" name="appointmentId" value={id} />
                <Button type="submit">
                  <CreditCard />
                  Continue to Stripe checkout
                </Button>
              </form>
            ) : (
              <p role="alert" className="text-sm text-destructive">
                A valid service price is required before payment can be set up.
              </p>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
