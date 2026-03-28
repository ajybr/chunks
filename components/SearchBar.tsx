'use client'

import { useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Kbd } from '@/components/ui/kbd'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search files and folders..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-12 w-full"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <Kbd className="text-xs">
          /
        </Kbd>
      </div>
    </div>
  )
}
