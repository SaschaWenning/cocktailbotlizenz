"use client"
// Übersetzungen für Daten (Namen von Cocktails, Rezepten, Zutaten, Tabs …)
// -> Hier beliebig erweitern. Keys sind wie sie aktuell in DE vorliegen.
export type Lang = "de" | "en"

const COCKTAILS: Record<string, string> = {
  // Beispiele – bitte nach Bedarf ergänzen:
  Caipirinha: "Caipirinha",
  "Sex on the Beach": "Sex on the Beach",
  Mojito: "Mojito",
  "Cola Rum": "Rum & Cola",
  "Wodka Lemon": "Vodka Lemon",
  Hurricane: "Hurricane",
}

const INGREDIENTS: Record<string, string> = {
  Zucker: "Sugar",
  Rum: "Rum",
  Wodka: "Vodka",
  Zitronensaft: "Lemon Juice",
  Limettensaft: "Lime Juice",
  Cola: "Cola",
  Eis: "Ice",
  Wasser: "Water",
}

// Tabs / Bereiche, falls Strings als Daten aus Config kommen:
const TABS: Record<string, string> = {
  Cocktails: "Cocktails",
  Alkoholfrei: "Virgin",
  Shots: "Shots",
  Rezepte: "Recipes",
  Zutaten: "Ingredients",
  Kalibrierung: "Calibration",
  Füllstände: "Levels",
  Entlüften: "Venting",
  Reinigen: "Cleaning",
  Einstellungen: "Settings",
  "Versteckte Cocktails": "Hidden Cocktails",
}

export function trEntity(kind: "cocktail" | "ingredient" | "tab", value: string, lang: Lang) {
  if (lang !== "en") return value
  const dict = kind === "cocktail" ? COCKTAILS : kind === "ingredient" ? INGREDIENTS : TABS
  return dict[value] ?? value
}
