"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

function ProgressRoot({
  className,
  ...props
}: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress-root"
      className={cn("w-full", className)}
      {...props}
    />
  )
}

function ProgressTrack({
  className,
  ...props
}: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      data-slot="progress-track"
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(
        "h-full w-full rounded-full bg-primary transition-all duration-300",
        className
      )}
      {...props}
    />
  )
}

function ProgressValue({
  className,
  ...props
}: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      data-slot="progress-value"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export { ProgressRoot, ProgressTrack, ProgressIndicator, ProgressValue }
