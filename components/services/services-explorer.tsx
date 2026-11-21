"use client"

import * as React from "react"
import { Search, SlidersHorizontal } from "lucide-react"

import { ServiceCard } from "@/components/services/service-card"
import { Input } from "@/components/ui/input"
import type { SalonService } from "@/lib/services"

const suggestedCategories = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
]

type SortOrder = "newest" | "price-low" | "price-high"

export function ServicesExplorer({
  services,
  initialCategory = "",
}: {
  services: SalonService[]
  initialCategory?: string
}) {
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState(initialCategory)
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("newest")

  const categories = React.useMemo(
    () =>
      Array.from(
        new Set([
          ...suggestedCategories,
          ...services.map((service) => service.category),
        ])
      ),
    [services]
  )

  const filteredServices = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    const matches = services.filter((service) => {
      const matchesName = service.name.toLocaleLowerCase().includes(query)
      const matchesCategory =
        !category || service.category.toLocaleLowerCase() === category.toLocaleLowerCase()
      return matchesName && matchesCategory
    })

    if (sortOrder === "price-low") {
      return matches.sort((a, b) => a.price - b.price)
    }
    if (sortOrder === "price-high") {
      return matches.sort((a, b) => b.price - a.price)
    }
    return matches
  }, [category, search, services, sortOrder])

  return (
    <>
      <section
        aria-label="Search and filter services"
        className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.65fr)_minmax(12rem,0.55fr)] sm:p-5"
      >
        <label className="relative block">
          <span className="sr-only">Search services by name</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search services by name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 rounded-xl pl-9"
          />
        </label>

        <label className="relative block">
          <span className="sr-only">Filter by category</span>
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-input bg-background px-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Sort services by price</span>
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="newest">Newest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </section>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {filteredServices.length}{" "}
        {filteredServices.length === 1 ? "service" : "services"} available
      </p>

      {filteredServices.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <h2 className="font-heading text-xl font-semibold">
            {services.length === 0
              ? "Services are on their way"
              : "No matching services"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {services.length === 0
              ? "There are no active services to show just yet. Please check back soon."
              : "Try another search or category to find the service you’re looking for."}
          </p>
          {services.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setCategory("")
                setSortOrder("newest")
              }}
              className="mt-5 text-sm font-medium underline underline-offset-4"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </>
  )
}
