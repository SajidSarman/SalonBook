import Image from "next/image"
import Link from "next/link"
import { Clock3, MoveUpRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { SalonService } from "@/lib/services"

const priceFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
})

export function ServiceCard({ service }: { service: SalonService }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg">
      <Link
        href={`/services/${service.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-muted"
        aria-label={`View ${service.name}`}
      >
        <Image
          src={service.imageUrl || "/auth-image.jpg"}
          alt={service.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
          {service.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-lg font-semibold leading-snug">
            {service.name}
          </h3>
          <p className="shrink-0 text-sm font-semibold">
            {priceFormatter.format(service.price)}
          </p>
        </div>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
          {service.shortDescription}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" />
            {service.durationMinutes} min
          </span>
          <Button
            render={<Link href={`/services/${service.id}`} />}
            nativeButton={false}
            size="sm"
            variant="outline"
            className="rounded-full"
          >
            View details
            <MoveUpRight />
          </Button>
        </div>
      </div>
    </article>
  )
}
