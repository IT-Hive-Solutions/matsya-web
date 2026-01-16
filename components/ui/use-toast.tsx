"use client"

import { useState, useCallback } from "react"

interface Toast {
  id: string
  title: string
  description?: string
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36)
    const newToast = { id, title, description }

    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return { toast, toasts }
}
