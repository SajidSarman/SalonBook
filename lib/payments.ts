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
 * related appointment as paid. The Express API owns both writes, keyed by
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

  const amount = Number(((session.amount_total ?? 0) / 100).toFixed(2))
  const currency = (session.currency ?? "bdt").toUpperCase()

  const response = await proxyToExpress("/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appointmentId,
      customerId,
      amount,
      currency,
      stripeSessionId: session.id,
      status,
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Could not save the transaction: ${message}`)
  }

  return { appointmentId, customerId, status }
}
