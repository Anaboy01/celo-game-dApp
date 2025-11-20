'use client'

import { useState } from 'react'
import { Skeleton } from '@/components/ui/loading-skeleton'

interface ImageGridProps {
  images: string[]
  isLoading?: boolean
}

export function ImageGrid({ images, isLoading }: ImageGridProps) {
  const [loadedImages, setLoadedImages] = useState(new Set<number>())

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set([...prev, index]))
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {(images || [1, 2, 3, 4]).map((image, i) => {
        const isLoaded = loadedImages.has(i)
        return (
          <div
            key={i}
            className="relative aspect-square bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border border-primary/30 overflow-hidden group cursor-pointer hover:border-primary/50 transition"
          >
            {!isLoaded && <Skeleton className="absolute inset-0" />}
            <img
              src={typeof image === 'string' ? image : `/placeholder.svg?height=200&width=200&query=puzzle+image+${i}`}
              alt={`Puzzle image ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition"
              onLoad={() => handleImageLoad(i)}
              onError={() => handleImageLoad(i)}
              crossOrigin="anonymous"
            />
          </div>
        )
      })}
    </div>
  )
}
