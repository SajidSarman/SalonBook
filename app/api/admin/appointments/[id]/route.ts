import { getApiSession, hasRole } from "@/lib/api-auth"
import { proxyToExpress } from "@/lib/express-api"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getApiSession()
  if (!session?.user) {
    return Response.json(
      { message: "Sign in to manage appointments." },
      {
        status: 401,
      }
    )
  }
  if (!hasRole(session.user, "admin")) {
    return Response.json({ message: "Admin access required." }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: "Invalid request body." }, { status: 400 })
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("status" in body) ||
    (body.status !== "Confirmed" && body.status !== "Cancelled")
  ) {
    return Response.json(
      { message: "Invalid appointment status." },
      {
        status: 400,
      }
    )
  }

  const { id } = await params
  return proxyToExpress(`/appointments/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: body.status }),
  })
}
