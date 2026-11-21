import { proxyToExpress } from "@/lib/express-api"

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date")
  if (!date) {
    return Response.json(
      { message: "Choose an appointment date." },
      {
        status: 400,
      }
    )
  }

  return proxyToExpress(`/appointment-slots?date=${encodeURIComponent(date)}`)
}
