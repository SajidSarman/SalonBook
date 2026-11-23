"use client"

import { toast } from "@/components/ui/toast"

export function useToast() {
  return {
    success: (title: string, description?: string) =>
      toast.add({ type: "success", title, description }),
    error: (title: string, description?: string) =>
      toast.add({ type: "error", title, description }),
  }
}
