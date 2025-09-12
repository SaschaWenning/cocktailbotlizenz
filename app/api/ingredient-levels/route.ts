import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import { join } from "path"
import type { IngredientLevel } from "@/types/ingredient-level"

const DATA_DIR = "data"
const INGREDIENT_LEVELS_FILE = join(DATA_DIR, "ingredient-levels.json")

// Fallback-Daten falls keine Datei existiert
const defaultIngredientLevels: IngredientLevel[] = []

let cachedIngredientLevels: IngredientLevel[] | null = null

async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    console.error("[v0] Error creating data directory:", error)
  }
}

async function getIngredientLevelsFromFile(): Promise<IngredientLevel[]> {
  if (cachedIngredientLevels !== null) {
    return cachedIngredientLevels
  }

  try {
    await ensureDataDirectory()
    const data = await fs.readFile(INGREDIENT_LEVELS_FILE, "utf-8")
    cachedIngredientLevels = JSON.parse(data)
    console.log("[v0] Loaded ingredient levels from file:", cachedIngredientLevels.length)
    return cachedIngredientLevels
  } catch (error) {
    console.log("[v0] No ingredient levels file found, using defaults")

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ingredient-levels")
        if (stored) {
          cachedIngredientLevels = JSON.parse(stored)
          return cachedIngredientLevels
        }
      } catch (localError) {
        console.error("[v0] Error loading from localStorage:", localError)
      }
    }

    cachedIngredientLevels = [...defaultIngredientLevels]
    return cachedIngredientLevels
  }
}

async function saveIngredientLevelsToFile(levels: IngredientLevel[]): Promise<void> {
  try {
    await ensureDataDirectory()
    await fs.writeFile(INGREDIENT_LEVELS_FILE, JSON.stringify(levels, null, 2))
    cachedIngredientLevels = levels
    console.log("[v0] Saved ingredient levels to file:", levels.length)
  } catch (error) {
    console.error("[v0] Error saving ingredient levels to file:", error)

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ingredient-levels", JSON.stringify(levels))
        cachedIngredientLevels = levels
        console.log("[v0] Saved ingredient levels to localStorage as fallback")
      } catch (localError) {
        console.error("[v0] Error saving to localStorage:", localError)
      }
    }
  }
}

export async function GET() {
  try {
    const levels = await getIngredientLevelsFromFile()
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
    await saveIngredientLevelsToFile(levels)
    console.log("[v0] Saved ingredient levels:", levels.length)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving ingredient levels:", error)
    return NextResponse.json({ success: false, error: "Failed to save ingredient levels" }, { status: 500 })
  }
}
