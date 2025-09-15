"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Languages, Check } from "lucide-react"
import { useLanguage, type Language } from "@/lib/i18n"

interface LanguageSettingsProps {
  onClose?: () => void
}

export default function LanguageSettings({ onClose }: LanguageSettingsProps) {
  const { language, setLanguage, t } = useLanguage()

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    // Optional: Show toast notification
    setTimeout(() => {
      if (onClose) onClose()
    }, 500)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[hsl(var(--cocktail-card-bg))] border-[hsl(var(--cocktail-card-border))]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-[hsl(var(--cocktail-text))]">
            <Languages className="h-6 w-6 text-[hsl(var(--cocktail-primary))]" />
            {t.languageSettings}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[hsl(var(--cocktail-text-muted))]">{t.selectLanguage}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleLanguageChange("de")}
              className={`h-16 flex items-center justify-between p-4 ${
                language === "de"
                  ? "bg-[hsl(var(--cocktail-primary))] text-black"
                  : "bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] border border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-button-hover))]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇩🇪</span>
                <span className="font-semibold">{t.german}</span>
              </div>
              {language === "de" && <Check className="h-5 w-5" />}
            </Button>

            <Button
              onClick={() => handleLanguageChange("en")}
              className={`h-16 flex items-center justify-between p-4 ${
                language === "en"
                  ? "bg-[hsl(var(--cocktail-primary))] text-black"
                  : "bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] border border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-button-hover))]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇺🇸</span>
                <span className="font-semibold">{t.english}</span>
              </div>
              {language === "en" && <Check className="h-5 w-5" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
