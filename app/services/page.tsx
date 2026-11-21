import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { ServicesExplorer } from "@/components/services/services-explorer"
import { getActiveServices } from "@/lib/services"

type ServicesPageProps = {
  searchParams: Promise<{ category?: string | string[] }>
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const [{ category }, services] = await Promise.all([
    searchParams,
    getActiveServices(),
  ])
  const initialCategory = Array.isArray(category) ? category[0] : category

  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <header className="max-w-2xl">
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Home
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Take a moment for yourself
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Browse salon services
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Explore active services, find the right fit, and see the details
          before you decide.
        </p>
      </header>

      <ServicesExplorer
        services={services}
        initialCategory={initialCategory}
      />
    </main>
  )
}
