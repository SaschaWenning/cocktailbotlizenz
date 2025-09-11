import { type NextRequest, NextResponse } from "next/server"
import type { IngredientLevel } from "@/types/ingredient-level"

const INGREDIENT_LEVELS_FILE = "ingredient-levels-data.json"

// Fallback-Daten falls keine Datei existiert
const defaultIngredientLevels: IngredientLevel[] = []

let cachedIngredientLevels: IngredientLevel[] | null = null

function getIngredientLevelsFromStorage(): IngredientLevel[] {
  if (cachedIngredientLevels !== null) {
    return cachedIngredientLevels
  }

  try {
    // In Browser-Umgebung verwende localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ingredient-levels")
      if (stored) {
        cachedIngredientLevels = JSON.parse(stored)
        return cachedIngredientLevels
      }
    }
  } catch (error) {
    console.error("[v0] Error loading ingredient levels from storage:", error)
  }

  cachedIngredientLevels = [...defaultIngredientLevels]
  return cachedIngredientLevels
}

function saveIngredientLevelsToStorage(levels: IngredientLevel[]): void {
  try {
    // In Browser-Umgebung verwende localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("ingredient-levels", JSON.stringify(levels))
    }
    cachedIngredientLevels = levels
  } catch (error) {
    console.error("[v0] Error saving ingredient levels to storage:", error)
  }
}

export async function GET() {
  try {
    const levels = getIngredientLevelsFromStorage()
    console.log("[v0] Returning ingredient levels:", levels.length)
    return NextResponse.json(levels)
  } catch (error) {
    console.error("[v0] Error in ingredient levels GET:", error)
    return NextResponse.json(defaultIngredientLevels)
  }
}

export async function POST(request: NextRequest) {
  try {
    const levels: IngredientLevel[] = await request.json()
    saveIngredientLevelsToStorage(levels)
    console.log("[v0] Saved ingredient levels:", levels.length)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving ingredient levels:", error)
    return NextResponse.json({ success: false, error: "Failed to save ingredient levels" }, { status: 500 })
  }
}
