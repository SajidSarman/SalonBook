import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck2,
  Heart,
  Search,
  Sparkles,
} from "lucide-react"
import { connection } from "next/server"

import { ServiceCard } from "@/components/services/service-card"
import { Button } from "@/components/ui/button"
import { getFeaturedServices } from "@/lib/services"

const categories = [
  { name: "Haircut & Styling", description: "Fresh cuts and signature looks", icon: Sparkles },
  { name: "Hair Coloring", description: "Color that feels like you", icon: Heart },
  { name: "Hair Treatment", description: "A little extra care for your hair", icon: Sparkles },
  { name: "Facial & Skincare", description: "A brighter, calmer complexion", icon: Heart },
  { name: "Makeup", description: "Looks for everyday and everything", icon: Sparkles },
  { name: "Manicure & Pedicure", description: "Polished from fingertips to toes", icon: Heart },
  { name: "Spa & Massage", description: "Make room to unwind", icon: Sparkles },
]

const benefits = [
  {
    title: "Find your kind of salon",
    description: "Explore salon services and compare what feels right for you.",
    icon: Search,
  },
  {
    title: "Know what to expect",
    description: "See service details, pricing, and duration before you go.",
    icon: Heart,
  },
  {
    title: "Make time for you",
    description: "Discover a new favorite and plan your next self-care day.",
    icon: CalendarCheck2,
  },
]

export default async function HomePage() {
  await connection()
  const featuredServices = await getFeaturedServices()

  return (
    <main>
      <section className="relative isolate min-h-[min(680px,calc(100svh-4rem))] overflow-hidden bg-zinc-950 text-white">
        <Image
          src="/auth-image.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="z-0 object-cover object-center"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
        <div className="relative z-20 mx-auto flex min-h-[min(680px,calc(100svh-4rem))] max-w-7xl items-center px-6 py-20 sm:px-10 lg:px-12">
          <div className="max-w-2xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              SalonBook · your moment, your way
            </p>
            <h1 className="font-heading text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              A little care
              <br />
              goes a long way.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/75 sm:text-lg">
              Find a service that fits your style, your schedule, and the way
              you want to feel.
            </p>
            <Button
              render={<Link href="/services" />}
              nativeButton={false}
              size="lg"
              className="mt-9 h-12 rounded-full bg-white px-6 text-zinc-950 hover:bg-white/90"
            >
              Explore salon services
              <ArrowRight />
            </Button>
          </div>
        </div>
        <div className="absolute bottom-8 right-8 z-20 hidden max-w-48 text-right text-xs leading-5 text-white/60 sm:block">
          Your next good hair day starts here.
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-12 lg:py-24">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Make it a good day
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Featured salon services
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              A few ways to refresh your look and make time for yourself.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            Browse all services <ArrowRight className="size-4" />
          </Link>
        </div>
        {featuredServices.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
            <h3 className="font-heading text-xl font-semibold">
              New services are on their way
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Check back soon to discover what our salons have to offer.
            </p>
          </div>
        )}
      </section>

      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-12 lg:py-24">
          <div className="mb-9 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Find your feel-good ritual
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Explore by category
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              From a quick refresh to a full reset, find the kind of care
              you’re looking for.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ name, description, icon: Icon }) => (
              <Link
                key={name}
                href={`/services?category=${encodeURIComponent(name)}`}
                className="group rounded-2xl border bg-background p-5 transition-colors hover:border-foreground/30"
              >
                <span className="mb-7 inline-flex size-10 items-center justify-center rounded-full bg-muted">
                  <Icon className="size-4" />
                </span>
                <h3 className="font-medium">{name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
                <ArrowRight className="mt-4 size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-12 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              The SalonBook way
            </p>
            <h2 className="mt-3 max-w-md font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              More time for the things that make you feel good.
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {benefits.map(({ title, description, icon: Icon }, index) => (
              <article key={title} className="border-t pt-5">
                <div className="flex items-center justify-between">
                  <Icon className="size-5" />
                  <span className="text-xs text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-7 font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
