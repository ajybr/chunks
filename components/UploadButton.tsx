"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface UploadButtonProps {
  onClick?: () => void
  disabled?: boolean
}

export function UploadButton({ onClick, disabled }: UploadButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="sm"
      className="gap-2"
      disabled={disabled}
    >
      <Plus className="h-4 w-4" />
      Upload
    </Button>
  )
}
