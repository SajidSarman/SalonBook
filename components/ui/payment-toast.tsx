"use client"

import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

type PaymentToastProps = {
  type: "success" | "error"
  title: string
  description?: string
}

export function PaymentToast({
  type,
  title,
  description,
}: PaymentToastProps) {
  const { success, error } = useToast()

  useEffect(() => {
    if (type === "success") {
      success(title, description)
    } else {
      error(title, description)
    }
  }, [type, title, description, success, error])

  return null
}
