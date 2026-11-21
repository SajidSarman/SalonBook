import { getApiSession, hasRole } from "@/lib/api-auth"
import { proxyToExpress } from "@/lib/express-api"

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getApiSession()
  if (!session?.user) {
    return Response.json(
      { message: "Sign in to cancel an appointment." },
      {
        status: 401,
      }
    )
  }
  if (!hasRole(session.user, "customer")) {
    return Response.json(
      { message: "Only customers can cancel their own requests." },
      { status: 403 }
    )
  }

  const { id } = await params
  return proxyToExpress(`/appointments/${encodeURIComponent(id)}/cancel`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId: session.user.id }),
  })
}
