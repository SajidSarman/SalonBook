import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { parseAppointment } from "@/lib/appointments"
import { getApiSession } from "@/lib/api-auth"
import { proxyToExpress } from "@/lib/express-api"
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

    const appointmentResponse = await proxyToExpress(
      `/appointments/${encodeURIComponent(appointmentId)}?customerId=${encodeURIComponent(authSession.user.id)}`
    )

    if (appointmentResponse.status === 404) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 }
      )
    }
    if (!appointmentResponse.ok) {
      return NextResponse.json(
        { error: "Could not load the appointment." },
        { status: 502 }
      )
    }

    const appointment = parseAppointment(await appointmentResponse.json())

    if (appointment.status !== "Confirmed") {
      return NextResponse.json(
        { error: "This appointment is not confirmed." },
        { status: 409 }
      )
    }
    if (appointment.paymentStatus === "Paid") {
      return NextResponse.json(
        { error: "This appointment is already paid." },
        { status: 409 }
      )
    }
    if (appointment.servicePrice === null || appointment.servicePrice <= 0) {
      return NextResponse.json(
        { error: "This service has no valid price." },
        { status: 409 }
      )
    }

    const headersList = await headers()
    const origin = headersList.get("origin") ?? new URL(request.url).origin

    const session = await stripe.checkout.sessions.create({
      customer_email: authSession.user.email,
      client_reference_id: appointmentId,
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: appointment.serviceName,
              description: `${appointment.appointmentDate} · ${appointment.timeSlot}`,
            },
            unit_amount: Math.round(appointment.servicePrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      submit_type: "book",
      success_url: `${origin}/dashboard/customer/appointments/${encodeURIComponent(appointmentId)}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/customer/appointments/${encodeURIComponent(appointmentId)}/checkout/cancel`,
      metadata: {
        appointmentId,
        customerId: authSession.user.id,
        serviceName: appointment.serviceName,
      },
      integration_identifier: "SalonBook-Web-001",
    })

    return NextResponse.redirect(session.url as string, 303)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
