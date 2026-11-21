import { getApiSession, hasRole } from "@/lib/api-auth"
import { proxyToExpress } from "@/lib/express-api"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getApiSession()
  if (!session?.user) {
    return Response.json(
      { message: "Sign in to view this appointment." },
      { status: 401 }
    )
  }
  if (!hasRole(session.user, "customer")) {
    return Response.json(
      { message: "Customer access required." },
      { status: 403 }
    )
  }

  const { id } = await params
  return proxyToExpress(
    `/appointments/${encodeURIComponent(id)}?customerId=${encodeURIComponent(session.user.id)}`
  )
}
