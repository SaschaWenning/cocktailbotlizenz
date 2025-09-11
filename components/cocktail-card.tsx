"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Cocktail } from "@/types/cocktail"

interface CocktailCardProps {
  cocktail: Cocktail
  onClick: () => void
}

export default function CocktailCard({ cocktail, onClick }: CocktailCardProps) {
  const [imageSrc, setImageSrc] = useState<string>("")
  const [imageStatus, setImageStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    const loadImage = async () => {
      console.log(`[v0] Loading image for ${cocktail.name}: ${cocktail.image}`)
      setImageStatus("loading")

      if (!cocktail.image) {
        const placeholder = `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(cocktail.name)}`
        setImageSrc(placeholder)
        setImageStatus("success")
        return
      }

      const strategies = [
        // 1. Originaler Pfad
        cocktail.image,
        // 2. Fallback für alkoholfreie Cocktails (ohne /images/cocktails/)
        cocktail.image.replace("/images/cocktails/", "/"),
        // 3. Platzhalter
        `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(cocktail.name)}`,
      ]

      for (let i = 0; i < strategies.length; i++) {
        const testPath = strategies[i]
        console.log(`[v0] Testing image path ${i + 1}/${strategies.length} for ${cocktail.name}: ${testPath}`)

        try {
          const success = await testImagePath(testPath)
          if (success) {
            console.log(`[v0] ✅ Image loaded successfully for ${cocktail.name}: ${testPath}`)
            setImageSrc(testPath)
            setImageStatus("success")
            return
          }
        } catch (error) {
          console.log(`[v0] ❌ Image failed for ${cocktail.name}: ${testPath}`)
        }
      }

      // Fallback auf Platzhalter
      console.log(`[v0] ❌ No working image found for ${cocktail.name}, using placeholder`)
      const placeholder = `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(cocktail.name)}`
      setImageSrc(placeholder)
      setImageStatus("error")
    }

    loadImage()
  }, [cocktail.image, cocktail.name])

  const testImagePath = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = src
    })
  }

  return (
    <Card
      className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer bg-black border-[hsl(var(--cocktail-card-border))] hover:border-[hsl(var(--cocktail-primary))]/50"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={cocktail.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          crossOrigin="anonymous"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge */}
        <Badge className="absolute top-3 right-3 bg-[hsl(var(--cocktail-primary))] text-black font-medium shadow-lg">
          {cocktail.alcoholic ? "Alkoholisch" : "Alkoholfrei"}
        </Badge>

        {/* Debug Info (nur in Development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="absolute bottom-2 left-2 text-xs bg-black/70 text-white p-1 rounded">
            {imageStatus === "loading" && "🔄"}
            {imageStatus === "success" && "✅"}
            {imageStatus === "error" && "❌"}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-[hsl(var(--cocktail-text))] line-clamp-1 group-hover:text-[hsl(var(--cocktail-primary))] transition-colors duration-200">
            {cocktail.name}
          </h3>
          <p className="text-sm text-[hsl(var(--cocktail-text-muted))] line-clamp-2 leading-relaxed">
            {cocktail.description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
