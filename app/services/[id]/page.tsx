import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Clock3 } from "lucide-react"
import { notFound } from "next/navigation"

import { getActiveServiceById } from "@/lib/services"

const priceFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
})

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const service = await getActiveServiceById(id)

  if (!service) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12 lg:py-16">
      <Link
        href="/services"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All services
      </Link>
      <article className="grid overflow-hidden rounded-3xl border bg-card lg:grid-cols-2">
        <div className="relative min-h-72 bg-muted sm:min-h-96">
          <Image
            src={service.imageUrl || "/auth-image.jpg"}
            alt={service.name}
            fill
            unoptimized
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {service.category}
          </p>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {service.name}
          </h1>
          <p className="mt-5 leading-7 text-muted-foreground">
            {service.shortDescription}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 border-t pt-6">
            <p className="text-lg font-semibold">
              {priceFormatter.format(service.price)}
            </p>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="size-4" />
              {service.durationMinutes} minutes
            </span>
          </div>
        </div>
      </article>
    </main>
  )
}
