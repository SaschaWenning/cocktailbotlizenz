export type IngredientLevel = {
  ingredientId: string
  capacity: number
  currentAmount: number
  lastRefill: Date | string
}

const STORAGE_KEY = "cocktailbot-ingredient-levels"

function revive(levels: any[]): IngredientLevel[] {
  return (levels ?? []).map((l) => ({
    ...l,
    lastRefill: l?.lastRefill ? new Date(l.lastRefill) : new Date(),
  }))
}

export function readLevels(initials: IngredientLevel[]): IngredientLevel[] {
  try {
    if (typeof window === "undefined") {
      // Server-side: return initials
      return revive(initials)
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      // Erststart: Initialwerte speichern
      writeLevels(initials)
      return revive(initials)
    }

    const json = JSON.parse(stored)
    return revive(json)
  } catch {
    // Fehler: Initialwerte verwenden
    writeLevels(initials)
    return revive(initials)
  }
}

export function writeLevels(levels: IngredientLevel[]) {
  try {
    if (typeof window === "undefined") {
      // Server-side: nichts tun
      return
    }

    const serializable = levels.map((l) => ({
      ...l,
      lastRefill: new Date(l.lastRefill).toISOString(),
    }))

    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable, null, 2))
  } catch (error) {
    console.error("Failed to save ingredient levels:", error)
  }
}
