"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Languages, Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import type { Language } from "@/contexts/language-context"

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()
  const [showSelector, setShowSelector] = useState(false)

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    setShowSelector(false)
  }

  if (showSelector) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[hsl(var(--cocktail-text))]">{t("language.title")}</h3>
          <Button
            variant="outline"
            onClick={() => setShowSelector(false)}
            className="bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))]"
          >
            {t("common.back")}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Button
            onClick={() => handleLanguageChange("de")}
            className={`flex items-center justify-between p-6 h-auto ${
              language === "de"
                ? "bg-[hsl(var(--cocktail-primary))] text-black"
                : "bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] hover:bg-[hsl(var(--cocktail-card-border))]"
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🇩🇪</span>
              <span className="text-lg font-semibold">{t("language.german")}</span>
            </div>
            {language === "de" && <Check className="h-5 w-5" />}
          </Button>

          <Button
            onClick={() => handleLanguageChange("en")}
            className={`flex items-center justify-between p-6 h-auto ${
              language === "en"
                ? "bg-[hsl(var(--cocktail-primary))] text-black"
                : "bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] hover:bg-[hsl(var(--cocktail-card-border))]"
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🇺🇸</span>
              <span className="text-lg font-semibold">{t("language.english")}</span>
            </div>
            {language === "en" && <Check className="h-5 w-5" />}
          </Button>
        </div>

        <div className="text-center text-[hsl(var(--cocktail-text-muted))]">
          {t("language.current")}: {language === "de" ? t("language.german") : t("language.english")}
        </div>
      </div>
    )
  }

  return (
    <Button
      onClick={() => setShowSelector(true)}
      className="bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))] flex items-center space-x-2"
    >
      <Languages className="h-4 w-4" />
      <span>{language.toUpperCase()}</span>
    </Button>
  )
}
