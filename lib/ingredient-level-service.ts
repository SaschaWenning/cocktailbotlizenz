"use server"

import type { IngredientLevel } from "@/types/ingredient-level"
import type { Cocktail } from "@/types/cocktail"
import { initialIngredientLevels } from "@/data/ingredient-levels"

let ingredientLevels: IngredientLevel[] = []
let isInitialized = false

async function ensureInitialized(): Promise<void> {
  if (!isInitialized) {
    try {
      const response = await fetch("/api/ingredient-levels", {
        method: "GET",
        cache: "no-store",
      })
      if (response.ok) {
        ingredientLevels = await response.json()
        console.log("[v0] Verwende gecachte Füllstände:", ingredientLevels.length)
      }
    } catch (error) {
      console.log("[v0] Keine gespeicherten Daten gefunden, starte mit leerem Array")
      ingredientLevels = []
    }
    isInitialized = true
  }
}

export async function loadIngredientLevelsFromFile(): Promise<IngredientLevel[]> {
  try {
    console.log("[v0] 🔄 Lade Füllstände aus localStorage...")

    const response = await fetch("/api/ingredient-levels", {
      method: "GET",
      cache: "no-store",
    })

    if (response.ok) {
      const levels = await response.json()
      console.log("[v0] ✅ Füllstände erfolgreich geladen:", levels.length)

      ingredientLevels = levels
      isInitialized = true

      return levels
    } else {
      throw new Error("Fehler beim Laden der Daten")
    }
  } catch (error) {
    console.error("[v0] ❌ Fehler beim manuellen Laden:", error)
    throw new Error("Fehler beim manuellen Laden!")
  }
}

// Füllstände abrufen und automatisch neue Zutaten initialisieren
export async function getIngredientLevels(): Promise<IngredientLevel[]> {
  await ensureInitialized()

  // Hole alle Cocktails und extrahiere verwendete Zutaten
  const { getAllCocktails } = await import("@/lib/cocktail-machine")
  const cocktails = await getAllCocktails()

  const usedIngredients = new Set<string>()
  cocktails.forEach((cocktail) => {
    cocktail.recipe.forEach((item) => {
      usedIngredients.add(item.ingredientId)
    })
  })

  let hasChanges = false

  for (const ingredientId of usedIngredients) {
    const existingIndex = ingredientLevels.findIndex((level) => level.ingredientId === ingredientId)

    if (existingIndex === -1) {
      const defaultCapacity = getDefaultCapacityForIngredient(ingredientId)

      const newLevel: IngredientLevel = {
        ingredientId,
        currentAmount: 0,
        capacity: defaultCapacity,
        lastRefill: new Date(),
      }
      ingredientLevels.push(newLevel)
      hasChanges = true
      console.log(`[v0] Neue Zutat initialisiert: ${ingredientId} (Kapazität: ${defaultCapacity}ml)`)
    }
  }

  if (hasChanges) {
    try {
      await fetch("/api/ingredient-levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ingredientLevels),
      })
    } catch (error) {
      console.error("[v0] Fehler beim Speichern:", error)
    }
  }

  console.log("[v0] Returning ingredient levels:", ingredientLevels.length)
  return ingredientLevels
}

// Füllstand für eine bestimmte Zutat aktualisieren
export async function updateIngredientLevel(
  ingredientId: string,
  newAmount: number,
  newCapacity?: number,
): Promise<IngredientLevel> {
  await ensureInitialized()

  const index = ingredientLevels.findIndex((level) => level.ingredientId === ingredientId)

  if (index === -1) {
    // Erstelle neue Zutat wenn sie nicht existiert
    const newLevel: IngredientLevel = {
      ingredientId,
      currentAmount: newAmount,
      capacity: newCapacity ?? Math.max(newAmount, 1000),
      lastRefill: new Date(),
    }
    ingredientLevels.push(newLevel)
    await saveIngredientLevelsToAPI(ingredientLevels)
    return newLevel
  }

  if (newCapacity) {
    ingredientLevels[index].capacity = newCapacity
  }

  const cappedAmount = Math.min(newAmount, ingredientLevels[index].capacity)

  const updatedLevel = {
    ...ingredientLevels[index],
    currentAmount: cappedAmount,
    lastRefill: new Date(),
  }

  ingredientLevels[index] = updatedLevel
  await saveIngredientLevelsToAPI(ingredientLevels)
  return updatedLevel
}

// Füllstand nach Cocktailzubereitung aktualisieren
export async function updateLevelsAfterCocktail(
  cocktail: Cocktail,
  size: number,
): Promise<{
  success: boolean
  insufficientIngredients: string[]
}> {
  await ensureInitialized()

  // Skaliere das Rezept auf die gewünschte Größe
  const currentTotal = cocktail.recipe.reduce((total, item) => total + item.amount, 0)
  const scaleFactor = size / currentTotal

  const scaledRecipe = cocktail.recipe.map((item) => ({
    ...item,
    amount: Math.round(item.amount * scaleFactor),
  }))

  // Prüfe, ob genügend von allen Zutaten vorhanden ist
  const insufficientIngredients: string[] = []

  for (const item of scaledRecipe) {
    const levelIndex = ingredientLevels.findIndex((level) => level.ingredientId === item.ingredientId)

    // Wenn kein Füllstand für diese Zutat existiert, initialisiere einen neuen
    if (levelIndex === -1) {
      await initializeNewIngredientLevel(item.ingredientId)
      continue
    }

    if (ingredientLevels[levelIndex].currentAmount < item.amount) {
      insufficientIngredients.push(item.ingredientId)
    }
  }

  // Wenn nicht genug von allen Zutaten vorhanden ist, breche ab
  if (insufficientIngredients.length > 0) {
    return {
      success: false,
      insufficientIngredients,
    }
  }

  // Aktualisiere die Füllstände
  for (const item of scaledRecipe) {
    const levelIndex = ingredientLevels.findIndex((level) => level.ingredientId === item.ingredientId)

    if (levelIndex === -1) continue

    ingredientLevels[levelIndex] = {
      ...ingredientLevels[levelIndex],
      currentAmount: Math.max(0, ingredientLevels[levelIndex].currentAmount - item.amount),
    }
  }

  await saveIngredientLevelsToAPI(ingredientLevels)

  return {
    success: true,
    insufficientIngredients: [],
  }
}

// Füllstand nach Shot-Zubereitung aktualisieren
export async function updateLevelAfterShot(
  ingredientId: string,
  amount: number,
): Promise<{
  success: boolean
}> {
  await ensureInitialized()

  // Finde den Füllstand für diese Zutat
  const levelIndex = ingredientLevels.findIndex((level) => level.ingredientId === ingredientId)

  // Wenn kein Füllstand für diese Zutat existiert, initialisiere einen neuen
  if (levelIndex === -1) {
    await initializeNewIngredientLevel(ingredientId)
    return { success: true }
  }

  // Prüfe, ob genügend von der Zutat vorhanden ist
  if (ingredientLevels[levelIndex].currentAmount < amount) {
    return { success: false }
  }

  // Aktualisiere den Füllstand
  ingredientLevels[levelIndex] = {
    ...ingredientLevels[levelIndex],
    currentAmount: Math.max(0, ingredientLevels[levelIndex].currentAmount - amount),
  }

  await saveIngredientLevelsToAPI(ingredientLevels)

  return { success: true }
}

// Zutat nachfüllen
export async function refillIngredient(ingredientId: string, amount: number): Promise<IngredientLevel> {
  await ensureInitialized()

  const index = ingredientLevels.findIndex((level) => level.ingredientId === ingredientId)

  if (index === -1) {
    throw new Error(`Zutat mit ID ${ingredientId} nicht gefunden`)
  }

  const level = ingredientLevels[index]
  const newAmount = Math.min(level.capacity, level.currentAmount + amount)

  const updatedLevel = {
    ...level,
    currentAmount: newAmount,
    lastRefill: new Date(),
  }

  ingredientLevels[index] = updatedLevel
  await saveIngredientLevelsToAPI(ingredientLevels)
  return updatedLevel
}

// Alle Zutaten auf maximale Kapazität auffüllen
export async function refillAllIngredients(): Promise<IngredientLevel[]> {
  await ensureInitialized()

  ingredientLevels = ingredientLevels.map((level) => ({
    ...level,
    currentAmount: level.capacity,
    lastRefill: new Date(),
  }))

  await saveIngredientLevelsToAPI(ingredientLevels)
  return ingredientLevels
}

// Füllstandskapazität aktualisieren
export async function updateIngredientCapacity(ingredientId: string, capacity: number): Promise<IngredientLevel> {
  await ensureInitialized()

  const index = ingredientLevels.findIndex((level) => level.ingredientId === ingredientId)

  if (index === -1) {
    const newLevel: IngredientLevel = {
      ingredientId,
      currentAmount: 0,
      capacity,
      lastRefill: new Date(),
    }
    ingredientLevels.push(newLevel)
    await saveIngredientLevelsToAPI(ingredientLevels)
    return newLevel
  }

  const updatedLevel = {
    ...ingredientLevels[index],
    capacity,
    currentAmount: Math.min(ingredientLevels[index].currentAmount, capacity),
  }

  ingredientLevels[index] = updatedLevel
  await saveIngredientLevelsToAPI(ingredientLevels)
  return updatedLevel
}

// Zurücksetzen auf Initialwerte (für Testzwecke)
export async function resetIngredientLevels(): Promise<IngredientLevel[]> {
  await ensureInitialized()

  ingredientLevels = [...initialIngredientLevels]
  await saveIngredientLevelsToAPI(ingredientLevels)
  return ingredientLevels
}

function getDefaultCapacityForIngredient(ingredientId: string): number {
  // Alkoholische Getränke - 700ml Standard
  const alcoholicIngredients = [
    "vodka",
    "dark-rum",
    "malibu",
    "peach-liqueur",
    "tequila",
    "triple-sec",
    "blue-curacao",
    "gin",
  ]

  // Säfte und Sirupe - 1000ml Standard
  const juicesAndSyrups = [
    "lime-juice",
    "orange-juice",
    "pineapple-juice",
    "passion-fruit-juice",
    "cranberry-juice",
    "lemon-juice",
    "grenadine",
    "vanilla-syrup",
    "almond-syrup",
    "coconut-syrup",
  ]

  if (alcoholicIngredients.includes(ingredientId)) {
    return 700 // Alkohol: 700ml
  } else if (juicesAndSyrups.includes(ingredientId)) {
    return 1000 // Säfte/Sirupe: 1000ml
  } else {
    return 1000 // Standard für unbekannte Zutaten
  }
}

export async function initializeNewIngredientLevel(ingredientId: string, capacity?: number): Promise<IngredientLevel> {
  await ensureInitialized()

  // Prüfe, ob bereits ein Füllstand für diese Zutat existiert
  const existingIndex = ingredientLevels.findIndex((level) => level.ingredientId === ingredientId)

  if (existingIndex !== -1) {
    return ingredientLevels[existingIndex]
  }

  const defaultCapacity = capacity ?? getDefaultCapacityForIngredient(ingredientId)

  const newLevel: IngredientLevel = {
    ingredientId,
    currentAmount: 0, // Keine Standardwerte - muss manuell eingegeben werden
    capacity: defaultCapacity, // Verwende zutatenspezifische Kapazität
    lastRefill: new Date(),
  }

  ingredientLevels.push(newLevel)
  await saveIngredientLevelsToAPI(ingredientLevels)
  return newLevel
}

async function saveIngredientLevelsToAPI(levels: IngredientLevel[]): Promise<void> {
  try {
    const response = await fetch("/api/ingredient-levels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(levels),
    })
    if (!response.ok) {
      throw new Error("Failed to save ingredient levels")
    }
    console.log("[v0] Saved ingredient levels to API:", levels.length)
  } catch (error) {
    console.error("[v0] Error saving ingredient levels to API:", error)
  }
}
