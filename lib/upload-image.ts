export type UploadScope = "profile" | "service"

export async function uploadImage(file: File, scope: UploadScope) {
  const body = new FormData()
  body.set("file", file)
  body.set("scope", scope)

  const response = await fetch("/api/uploads", { method: "POST", body })
  const result: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof result.message === "string"
        ? result.message
        : "Could not upload the image."
    throw new Error(message)
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("url" in result) ||
    typeof result.url !== "string"
  ) {
    throw new Error("The upload did not return an image URL.")
  }

  return result.url
}

export function isHttpImageUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}
