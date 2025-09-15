"use client"
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type Lang = "de" | "en"

interface I18nContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const translations = {
  de: {
    "levels.title": "Füllstände",
    "service.shots": "Shots",
    "service.venting": "Entlüften",
    "service.cleaning": "Reinigen",
    "service.calibration": "Kalibrierung",
    "service.ingredients": "Zutaten",
    "service.recipes": "Rezepte",
    "service.hidden": "Versteckte Cocktails",
    "language.select": "Sprache wählen",
    "language.german": "Deutsch",
    "language.english": "English",
  },
  en: {
    "levels.title": "Levels",
    "service.shots": "Shots",
    "service.venting": "Venting",
    "service.cleaning": "Cleaning",
    "service.calibration": "Calibration",
    "service.ingredients": "Ingredients",
    "service.recipes": "Recipes",
    "service.hidden": "Hidden Cocktails",
    "language.select": "Select Language",
    "language.german": "Deutsch",
    "language.english": "English",
  },
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("de")

  useEffect(() => {
    const saved = localStorage.getItem("cocktail-lang")
    if (saved === "en" || saved === "de") {
      setLang(saved)
    }
  }, [])

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang)
    localStorage.setItem("cocktail-lang", newLang)
  }

  const t = (key: string) => {
    return translations[lang][key as keyof (typeof translations)[typeof lang]] || key
  }

  return <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
