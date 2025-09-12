import { promises as fs } from "fs"
import { initialIngredientLevels } from "@/data/ingredient-levels"

const FILE = "/home/pi/cocktailbot/cocktailbot-main/data/ingredient-levels-data.json"

// Typ vom Default ableiten (kein zusätzliches Typ-Gerödel nötig)
export type IngredientLevel = (typeof initialIngredientLevels)[number]

export async function getIngredientLevelsRuntime(): Promise<IngredientLevel[]> {
  try {
    console.log("[v0] Versuche Datei zu lesen:", FILE)
    const raw = await fs.readFile(FILE, "utf8")
    const arr = JSON.parse(raw) as any[]
    console.log("[v0] Datei erfolgreich gelesen, Anzahl Zutaten:", arr.length)
    // lastRefill sauber zu Date machen
    return arr.map((l) => ({ ...l, lastRefill: l?.lastRefill ? new Date(l.lastRefill) : new Date() }))
  } catch (error) {
    console.log("[v0] Datei nicht gefunden oder fehlerhaft, verwende Standardwerte:", error)
    // Datei (noch) nicht da → deine bisherigen Defaults
    return initialIngredientLevels
  }
}
