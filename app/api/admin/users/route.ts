import { getApiSession, hasRole } from "@/lib/api-auth"
import { proxyToExpress } from "@/lib/express-api"

export async function GET() {
  const session = await getApiSession()
  if (!session?.user) {
    return Response.json(
      { message: "Sign in to manage users." },
      {
        status: 401,
      }
    )
  }
  if (!hasRole(session.user, "admin")) {
    return Response.json({ message: "Admin access required." }, { status: 403 })
  }

  return proxyToExpress("/admin/users")
}
