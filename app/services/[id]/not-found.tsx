import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ServiceNotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
        Service unavailable
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold">
        We couldn’t find that service
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        It may not exist, or it may no longer be active for booking.
      </p>
      <Link
        href="/services"
        className="mt-7 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
      >
        <ArrowLeft className="size-4" />
        Browse active services
      </Link>
    </main>
  )
}
