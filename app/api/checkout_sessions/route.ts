import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { getApiSession } from "@/lib/api-auth"
import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const authSession = await getApiSession()

    if (!authSession?.user) {
      return NextResponse.json(
        { error: "Sign in to check out." },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const appointmentId = formData.get("appointmentId")

    if (typeof appointmentId !== "string" || appointmentId.length === 0) {
      return NextResponse.json(
        { error: "appointmentId is required" },
        { status: 400 }
      )
    }

    const headersList = await headers()
    const origin = headersList.get("origin") ?? new URL(request.url).origin

    const session = await stripe.checkout.sessions.create({
      customer_email: authSession.user.email,
      line_items: [
        {
          // Replace with the real service price once per-appointment pricing is wired up.
          price: "price_1UeIGX5AWKgaDnugtJ3Os7pa",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/dashboard/customer/appointments/${encodeURIComponent(appointmentId)}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/customer/appointments/${encodeURIComponent(appointmentId)}/checkout?canceled=true`,
      metadata: { appointmentId, customerId: authSession.user.id },
      integration_identifier: "SalonBook-Web-001",
    })

    return NextResponse.redirect(session.url as string, 303)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
