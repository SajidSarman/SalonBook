import { getApiSession, hasRole } from "@/lib/api-auth"
import { APPOINTMENT_TIME_SLOTS } from "@/lib/appointment-slots"
import { proxyToExpress } from "@/lib/express-api"

export async function GET() {
  const session = await getApiSession()
  if (!session?.user) {
    return Response.json(
      { message: "Sign in to view your appointments." },
      {
        status: 401,
      }
    )
  }
  if (!hasRole(session.user, "customer")) {
    return Response.json(
      { message: "Customer access required." },
      { status: 403 }
    )
  }

  return proxyToExpress(
    `/appointments?customerId=${encodeURIComponent(session.user.id)}`
  )
}

export async function POST(request: Request) {
  const session = await getApiSession()
  if (!session?.user) {
    return Response.json(
      { message: "Sign in to request an appointment." },
      {
        status: 401,
      }
    )
  }
  if (!hasRole(session.user, "customer")) {
    return Response.json(
      { message: "Admin accounts cannot request customer appointments." },
      { status: 403 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: "Invalid request body." }, { status: 400 })
  }

  if (typeof body !== "object" || body === null) {
    return Response.json(
      { message: "Invalid appointment request." },
      {
        status: 400,
      }
    )
  }

  const payload = body as Record<string, unknown>
  const { serviceId, appointmentDate, timeSlot, additionalMessage } = payload
  const parsedDate =
    typeof appointmentDate === "string"
      ? new Date(`${appointmentDate}T00:00:00.000Z`)
      : null
  if (
    typeof serviceId !== "string" ||
    typeof appointmentDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) ||
    !parsedDate ||
    !Number.isFinite(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== appointmentDate ||
    appointmentDate < new Date().toISOString().slice(0, 10) ||
    typeof timeSlot !== "string" ||
    !APPOINTMENT_TIME_SLOTS.some((slot) => slot === timeSlot) ||
    (additionalMessage !== undefined &&
      (typeof additionalMessage !== "string" ||
        additionalMessage.length > 1000))
  ) {
    return Response.json(
      { message: "Invalid appointment request." },
      {
        status: 400,
      }
    )
  }

  return proxyToExpress("/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceId,
      appointmentDate,
      timeSlot,
      additionalMessage: additionalMessage ?? "",
      customer: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    }),
  })
}
