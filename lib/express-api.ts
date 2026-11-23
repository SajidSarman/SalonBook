import { headers } from "next/headers"

import { auth } from "@/lib/auth"

/**
 * How `proxyToExpress` authenticates the call to the Express API:
 * - `session`: mints a short-lived JWT from the Better Auth cookie session.
 * - `service`: mints a short-lived service JWT for trusted server-to-server
 *   calls that have no user session (the Stripe webhook).
 * - `public`: sends no credentials (public catalogue endpoints only).
 */
export type ProxyAuth = "session" | "service" | "public"

const SERVICE_SUBJECT = "salonbook-next-service"

async function createBearerToken(authMode: ProxyAuth) {
  if (authMode === "public") {
    return null
  }

  if (authMode === "service") {
    const { token } = await auth.api.signJWT({
      body: {
        payload: {
          sub: SERVICE_SUBJECT,
          name: "SalonBook Next.js",
          email: "",
          role: "service",
        },
      },
    })
    return token
  }

  const { token } = await auth.api.getToken({
    headers: await headers(),
  })
  return token
}

export async function proxyToExpress(
  path: string,
  init?: RequestInit,
  options: { auth?: ProxyAuth } = {}
) {
  const baseUrl = (
    process.env.EXPRESS_API_URL ?? "http://localhost:5000"
  ).replace(/\/+$/, "")

  const requestHeaders = new Headers(init?.headers)
  const authMode = options.auth ?? "session"

  try {
    const token = await createBearerToken(authMode)
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`)
    }
  } catch (error) {
    console.error("Could not create an API token:", error)
    return Response.json(
      {
        message:
          authMode === "service"
            ? "Could not authenticate the API request."
            : "Sign in required.",
      },
      { status: authMode === "service" ? 500 : 401 }
    )
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: requestHeaders,
      cache: "no-store",
    })

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ?? "application/json",
      },
    })
  } catch (error) {
    console.error("Could not reach the Express API:", error)
    return Response.json(
      { message: "The API service is unavailable." },
      { status: 502 }
    )
  }
}
