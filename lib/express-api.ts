export async function proxyToExpress(path: string, init?: RequestInit) {
  const baseUrl = (
    process.env.EXPRESS_API_URL ?? "http://localhost:5000"
  ).replace(/\/+$/, "")

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
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
      { message: "The appointment service is unavailable." },
      { status: 502 }
    )
  }
}
