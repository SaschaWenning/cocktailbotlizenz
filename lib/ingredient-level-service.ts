"use server"

import type { IngredientLevel } from "@/types/ingredient-level"
import type { Cocktail } from "@/types/cocktail"
import { initialIngredientLevels } from "@/data/ingredient-levels"

let ingredientLevels: IngredientLevel[] = []
let isInitialized = false

// Lade Ingredient Levels von der API
async function loadIngredientLevelsFromAPI(): Promise<IngredientLevel[]> {
  try {
    const response = await fetch("/api/ingredient-levels", {
      method: "GET",
      cache: "no-store",
    })
    if (response.ok) {
      const levels = await response.json()
      console.log("[v0] Loaded ingredient levels from API:", levels.length)
      return levels
    }
  } catch (error) {
    console.error("[v0] Error loading ingredient levels from API:", error)
  }

  console.log("[v0] API nicht verfügbar - verwende leeres Array")
  return []
}

// Speichere Ingredient Levels in der API
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

// Initialisiere das System beim ersten Aufruf
async function ensureInitialized(): Promise<void> {
  if (!isInitialized) {
    ingredientLevels = await loadIngredientLevelsFromAPI()
    isInitialized = true
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
      const { pumpConfig } = await import("@/data/pump-config")
      const pumpForIngredient = pumpConfig.find((pump) => pump.ingredient === ingredientId)

      const newLevel: IngredientLevel = {
        ingredientId,
        currentAmount: pumpForIngredient ? 700 : 0, // Nur angeschlossene Zutaten haben Startmenge
        capacity: 1000, // Standard-Kapazität
        lastRefill: new Date(),
      }
      ingredientLevels.push(newLevel)
      hasChanges = true
      console.log(`[v0] Neue Zutat initialisiert: ${ingredientId} (angeschlossen: ${!!pumpForIngredient})`)
    }
  }

  if (hasChanges) {
    await saveIngredientLevelsToAPI(ingredientLevels)
  }

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

// Füge eine Funktion hinzu, um Füllstände für neu angeschlossene Zutaten zu initialisieren
export async function initializeNewIngredientLevel(ingredientId: string, capacity = 1000): Promise<IngredientLevel> {
  await ensureInitialized()

  // Prüfe, ob bereits ein Füllstand für diese Zutat existiert
  const existingIndex = ingredientLevels.findIndex((level) => level.ingredientId === ingredientId)

  if (existingIndex !== -1) {
    return ingredientLevels[existingIndex]
  }

  // Erstelle einen neuen Füllstand für diese Zutat
  const newLevel: IngredientLevel = {
    ingredientId,
    currentAmount: Math.min(700, capacity), // Startmenge nicht größer als Kapazität
    capacity, // Verwende übergebene Kapazität
    lastRefill: new Date(),
  }

  ingredientLevels.push(newLevel)
  await saveIngredientLevelsToAPI(ingredientLevels)
  return newLevel
}
