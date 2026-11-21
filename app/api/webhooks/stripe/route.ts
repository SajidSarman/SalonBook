import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { fulfillCheckoutSession } from "@/lib/payments"
import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature")
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !secret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 400 }
    )
  }

  const payload = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid Stripe signature."
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        if (session.payment_status === "paid") {
          await fulfillCheckoutSession(session, "paid")
        }
        break
      }
      case "checkout.session.async_payment_succeeded":
        await fulfillCheckoutSession(event.data.object, "paid")
        break
      case "checkout.session.async_payment_failed":
        await fulfillCheckoutSession(event.data.object, "failed")
        break
    }
  } catch (err) {
    console.error("Stripe webhook fulfillment failed:", err)
    return NextResponse.json(
      { error: "Webhook fulfillment failed." },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
