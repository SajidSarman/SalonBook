import Link from "next/link"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PaymentToast } from "@/components/ui/payment-toast"
import {
  displayAppointmentTime,
  parseAppointment,
} from "@/lib/appointments"
import { requireRole } from "@/lib/auth-guard"
import { proxyToExpress } from "@/lib/express-api"
import { fulfillCheckoutSession } from "@/lib/payments"
import { stripe } from "@/lib/stripe"

const priceFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 2,
})

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ session_id?: string | string[] | undefined }>
}) {
  const session = await requireRole("customer")
  const { id } = await params
  const { session_id } = await searchParams
  const sessionId = typeof session_id === "string" ? session_id : null

  let paid = false
  let amountTotal: number | null = null

  if (sessionId) {
    try {
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
      const belongsToCustomer =
        checkoutSession.metadata?.appointmentId === id &&
        checkoutSession.metadata?.customerId === session.user.id

      const verified =
        belongsToCustomer &&
        checkoutSession.status === "complete" &&
        checkoutSession.payment_status === "paid"

      const reason = !belongsToCustomer
        ? "session does not belong to this customer or appointment"
        : checkoutSession.status !== "complete"
          ? `checkout status is ${checkoutSession.status}`
          : checkoutSession.payment_status !== "paid"
            ? `payment status is ${checkoutSession.payment_status}`
            : "ok"

      console.log("Stripe checkout session verification:", {
        appointmentId: id,
        sessionId,
        verified,
        reason,
        status: checkoutSession.status,
        paymentStatus: checkoutSession.payment_status,
        belongsToCustomer,
        amountTotal: checkoutSession.amount_total,
        currency: checkoutSession.currency,
      })

      if (verified) {
        paid = true
        amountTotal = checkoutSession.amount_total

        try {
          await fulfillCheckoutSession(checkoutSession, "paid")
        } catch (error) {
          // The webhook retries fulfillment; the payment itself is confirmed.
          console.error("Could not save the transaction:", error)
        }
      }
    } catch (error) {
      console.error("Could not verify the checkout session:", error)
    }
  }

  let appointment: ReturnType<typeof parseAppointment> | null = null
  const response = await proxyToExpress(
    `/appointments/${encodeURIComponent(id)}?customerId=${encodeURIComponent(session.user.id)}`
  )
  if (response.ok) {
    try {
      appointment = parseAppointment(await response.json())
    } catch (error) {
      console.error("Could not parse the appointment:", error)
    }
  }

  // The webhook may already have marked the appointment paid before the
  // redirect completes, so treat that as a successful payment too.
  if (!paid && appointment?.paymentStatus === "Paid") {
    paid = true
  }

  const displayAmount =
    amountTotal !== null
      ? amountTotal / 100
      : (appointment?.servicePrice ?? null)

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center py-12 text-center">
      <PaymentToast
        type={paid ? "success" : "error"}
        title={paid ? "Payment successful" : "Payment not confirmed"}
        description={
          paid
            ? "Thank you. Your payment has been received and your appointment is confirmed."
            : "We couldn't confirm this payment. If you were charged, it may take a moment to appear. Please check your appointments or try again."
        }
      />
      {paid ? (
        <CheckCircle2 className="size-14 text-emerald-600" aria-hidden="true" />
      ) : (
        <AlertCircle className="size-14 text-muted-foreground" aria-hidden="true" />
      )}

      <h1 className="mt-5 font-heading text-3xl font-semibold">
        {paid ? "Payment successful" : "Payment not confirmed"}
      </h1>

      <p className="mt-2 text-muted-foreground">
        {paid
          ? "Thank you. Your payment has been received and your appointment is confirmed."
          : "We couldn't confirm this payment. If you were charged, it may take a moment to appear. Please check your appointments or try again."}
      </p>

      {appointment && (
        <dl className="mt-6 grid w-full gap-3 rounded-2xl border bg-card p-5 text-left text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Service</dt>
            <dd className="font-medium">{appointment.serviceName}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Appointment</dt>
            <dd className="font-medium">
              {new Date(
                `${appointment.appointmentDate}T00:00:00`
              ).toLocaleDateString()}{" "}
              · {displayAppointmentTime(appointment.timeSlot)}
            </dd>
          </div>
          {displayAmount !== null && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Amount paid</dt>
              <dd className="font-semibold">
                {priceFormatter.format(displayAmount)}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Payment status</dt>
            <dd className="font-medium">
              {paid ? "Paid" : appointment.paymentStatus}
            </dd>
          </div>
        </dl>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button
          render={
            <Link href="/dashboard/customer#appointment-management-title" />
          }
          nativeButton={false}
        >
          View my appointments
        </Button>
        {!paid && (
          <Button
            variant="outline"
            render={
              <Link
                href={`/dashboard/customer/appointments/${encodeURIComponent(id)}/checkout`}
              />
            }
            nativeButton={false}
          >
            Try payment again
          </Button>
        )}
      </div>
    </div>
  )
}
