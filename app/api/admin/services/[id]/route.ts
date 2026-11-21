import { getApiSession, hasRole } from "@/lib/api-auth"
import { proxyToExpress } from "@/lib/express-api"

async function requireAdmin() {
  const session = await getApiSession()
  if (!session?.user) {
    return Response.json(
      { message: "Sign in to manage services." },
      { status: 401 }
    )
  }
  if (!hasRole(session.user, "admin")) {
    return Response.json({ message: "Admin access required." }, { status: 403 })
  }
  return null
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin()
  if (denied) return denied

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: "Invalid request body." }, { status: 400 })
  }

  const { id } = await params
  return proxyToExpress(`/admin/services/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id } = await params
  return proxyToExpress(`/admin/services/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}
