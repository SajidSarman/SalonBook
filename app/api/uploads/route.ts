import { getApiSession, hasRole } from "@/lib/api-auth"
import {
  ALLOWED_IMAGE_TYPES,
  ImageUploadError,
  MAX_IMAGE_BYTES,
  uploadImageToImgbb,
} from "@/lib/imgbb"

const MAX_MEGABYTES = Math.round(MAX_IMAGE_BYTES / (1024 * 1024))

/**
 * Image upload endpoint backed by imgbb.
 *
 * Accepts `multipart/form-data` with:
 * - `file`: the image to upload
 * - `scope`: `profile` (any signed-in user) or `service` (admins only)
 */
export async function POST(request: Request) {
  const session = await getApiSession()

  if (!session?.user) {
    return Response.json({ message: "Sign in to upload images." }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get("file")
  const scope = form.get("scope")

  if (!(file instanceof File)) {
    return Response.json({ message: "Choose an image to upload." }, { status: 400 })
  }

  if (scope !== "profile" && scope !== "service") {
    return Response.json({ message: "Invalid upload scope." }, { status: 400 })
  }

  if (scope === "service" && !hasRole(session.user, "admin")) {
    return Response.json(
      { message: "Admin access required." },
      { status: 403 }
    )
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return Response.json(
      { message: "Use a JPEG, PNG, WebP or GIF image." },
      { status: 415 }
    )
  }

  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    return Response.json(
      { message: `Images must be smaller than ${MAX_MEGABYTES} MB.` },
      { status: 413 }
    )
  }

  try {
    const url = await uploadImageToImgbb(file)
    return Response.json({ url }, { status: 201 })
  } catch (error) {
    if (error instanceof ImageUploadError) {
      return Response.json({ message: error.message }, { status: error.status })
    }

    console.error("Image upload failed:", error)
    return Response.json(
      { message: "Could not upload the image." },
      { status: 500 }
    )
  }
}
