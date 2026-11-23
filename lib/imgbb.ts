const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload"

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

type ImgbbResponse = {
  success?: boolean
  data?: {
    url?: unknown
    display_url?: unknown
  }
  error?: {
    message?: unknown
  }
}

export class ImageUploadError extends Error {
  status: number

  constructor(message: string, status = 502) {
    super(message)
    this.name = "ImageUploadError"
    this.status = status
  }
}

/**
 * Uploads an image to imgbb and returns its public URL.
 *
 * The API key stays on the server: the browser posts the file to
 * `/api/uploads`, which calls imgbb with `IMGBB_API_KEY`.
 */
export async function uploadImageToImgbb(file: File) {
  const apiKey = process.env.IMGBB_API_KEY

  if (!apiKey) {
    throw new ImageUploadError(
      "Image uploads are not configured. Add IMGBB_API_KEY to the server environment.",
      503
    )
  }

  const body = new URLSearchParams()
  body.set("image", Buffer.from(await file.arrayBuffer()).toString("base64"))
  body.set("name", file.name.slice(0, 80))

  let response: Response
  try {
    response = await fetch(
      `${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body,
        cache: "no-store",
      }
    )
  } catch (error) {
    console.error("Could not reach imgbb:", error)
    throw new ImageUploadError("Could not reach the image service.")
  }

  let result: ImgbbResponse
  try {
    result = (await response.json()) as ImgbbResponse
  } catch {
    throw new ImageUploadError("The image service returned an invalid response.")
  }

  if (!response.ok || result.success === false) {
    const message =
      typeof result.error?.message === "string"
        ? result.error.message
        : "The image could not be uploaded."
    throw new ImageUploadError(message)
  }

  const url =
    typeof result.data?.url === "string"
      ? result.data.url
      : typeof result.data?.display_url === "string"
        ? result.data.display_url
        : null

  if (!url) {
    throw new ImageUploadError("The image service did not return a URL.")
  }

  return url
}
