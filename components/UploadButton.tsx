
'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface UploadButtonProps {
  onClick?: () => void
}

export function UploadButton({ onClick }: UploadButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="sm"
      className="gap-2"
    >
      <Plus className="h-4 w-4" />
      Upload
    </Button>
  )
}
