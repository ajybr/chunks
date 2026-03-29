"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbNavProps {
  path: { id: string | null; name: string }[]
  onNavigate: (index: number) => void
}

export function BreadcrumbNav({ path, onNavigate }: BreadcrumbNavProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="h-8 gap-2 rounded-md border px-3 text-sm">
        {path.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            {index !== 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === path.length - 1 ? (
                <BreadcrumbPage>{segment.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  onClick={() => onNavigate(index)}
                  className="cursor-pointer"
                >
                  {segment.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
