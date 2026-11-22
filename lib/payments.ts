import "server-only"

import type Stripe from "stripe"

import { proxyToExpress } from "@/lib/express-api"

export type TransactionStatus = "paid" | "failed"

export type FulfillmentResult = {
  appointmentId: string
  customerId: string
  status: TransactionStatus
}

/**
 * Records a Checkout Session in the `transactions` collection and marks the
 * related appointment as paid. Only the session id is sent: the Express API
 * retrieves the session from Stripe itself, so the amount, currency and
 * customer are never taken from the caller. The write is keyed by
 * `stripeSessionId`, so this is safe to call more than once per session.
 */
export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
  status: TransactionStatus
): Promise<FulfillmentResult> {
  const appointmentId =
    session.metadata?.appointmentId ?? session.client_reference_id ?? null
  const customerId = session.metadata?.customerId ?? null

  if (!appointmentId || !customerId) {
    throw new Error("Checkout session is missing appointment metadata.")
  }

  const response = await proxyToExpress("/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stripeSessionId: session.id,
      status,
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Could not save the transaction: ${message}`)
  }

  const payload: unknown = await response.json().catch(() => null)
  const body =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : {}

  console.log("Transaction fulfillment:", {
    stripeSessionId: session.id,
    status,
    success: body.success !== false,
    message:
      typeof body.message === "string" ? body.message : "Transaction saved",
  })

  return { appointmentId, customerId, status }
}
