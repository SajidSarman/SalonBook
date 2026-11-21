export type SalonService = {
  id: string
  name: string
  category: string
  price: number
  durationMinutes: number
  shortDescription: string
  imageUrl: string | null
}

type ServiceResponse = {
  _id?: unknown
  id?: unknown
  serviceName?: unknown
  category?: unknown
  price?: unknown
  duration?: unknown
  description?: unknown
  image?: unknown
  status?: unknown
}

function getApiUrl(path: string) {
  const baseUrl = (
    process.env.EXPRESS_API_URL ?? "http://localhost:5000"
  ).replace(/\/+$/, "")

  return `${baseUrl}${path}`
}

function parseService(value: unknown): SalonService {
  if (typeof value !== "object" || value === null) {
    throw new Error("The Express API returned an invalid service.")
  }

  const document = value as ServiceResponse
  const id =
    typeof document._id === "string"
      ? document._id
      : typeof document.id === "string"
        ? document.id
        : null

  if (
    !id ||
    typeof document.serviceName !== "string" ||
    typeof document.category !== "string" ||
    typeof document.price !== "number" ||
    !Number.isFinite(document.price) ||
    typeof document.duration !== "number" ||
    !Number.isFinite(document.duration) ||
    typeof document.description !== "string"
  ) {
    throw new Error("The Express API returned a service with invalid fields.")
  }

  return {
    id,
    name: document.serviceName,
    category: document.category,
    price: document.price,
    durationMinutes: document.duration,
    shortDescription: document.description,
    imageUrl: typeof document.image === "string" ? document.image : null,
  }
}

async function fetchActiveServices(path: string): Promise<SalonService[]> {
  const response = await fetch(getApiUrl(path), { cache: "no-store" })

  if (!response.ok) {
    throw new Error(
      `Could not load salon services from Express (HTTP ${response.status}).`
    )
  }

  const data: unknown = await response.json()
  if (!Array.isArray(data)) {
    throw new Error("The Express API must return an array of services.")
  }

  const services = data.map((service): ServiceResponse => {
    if (
      typeof service !== "object" ||
      service === null ||
      !("status" in service) ||
      typeof service.status !== "string"
    ) {
      throw new Error("The Express API returned a service with no status.")
    }

    return service
  })

  return services
    .filter((service) => service.status === "active")
    .map(parseService)
}

export function getActiveServices(): Promise<SalonService[]> {
  return fetchActiveServices("/services")
}

export function getFeaturedServices(): Promise<SalonService[]> {
  return fetchActiveServices("/top6services")
}

export async function getActiveServiceById(
  id: string
): Promise<SalonService | null> {
  const response = await fetch(
    getApiUrl(`/services/${encodeURIComponent(id)}`),
    { cache: "no-store" }
  )

  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error(
      `Could not load the salon service from Express (HTTP ${response.status}).`
    )
  }

  const data: unknown = await response.json()
  if (
    typeof data !== "object" ||
    data === null ||
    !("status" in data) ||
    data.status !== "active"
  ) {
    return null
  }

  return parseService(data)
}
