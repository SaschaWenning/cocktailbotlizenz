"use client"

import CocktailCard from "@/components/cocktail-card"
import type { Cocktail } from "@/types/cocktail"
import { useLanguage } from "@/lib/i18n"

interface CocktailGridProps {
  cocktails: Cocktail[]
  onCocktailSelect?: (cocktail: Cocktail) => void
  onImageEditClick?: (cocktail: Cocktail) => void
  onDeleteCocktail?: (cocktailId: string) => void
}

export default function CocktailGrid({
  cocktails,
  onCocktailSelect,
  onImageEditClick,
  onDeleteCocktail,
}: CocktailGridProps) {
  const { t } = useLanguage()

  const handleCocktailClick = (cocktail: Cocktail) => {
    if (onCocktailSelect) {
      onCocktailSelect(cocktail)
    }
  }

  if (cocktails.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[hsl(var(--cocktail-text-muted))] text-lg">{t("noCocktailsFound")}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cocktails.map((cocktail) => (
        <CocktailCard key={cocktail.id} cocktail={cocktail} onClick={() => handleCocktailClick(cocktail)} />
      ))}
    </div>
  )
}
