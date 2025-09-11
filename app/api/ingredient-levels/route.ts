import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { IngredientLevel } from "@/types/ingredient-level"

const RASPBERRY_PI_DATA_DIR = "/home/pi/cocktailbot/cocktailbot-main/data"
const INGREDIENT_LEVELS_FILE = path.join(RASPBERRY_PI_DATA_DIR, "ingredient-levels-data.json")

// Fallback-Daten falls keine Datei existiert
const defaultIngredientLevels: IngredientLevel[] = []

let cachedIngredientLevels: IngredientLevel[] | null = null

async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.mkdir(RASPBERRY_PI_DATA_DIR, { recursive: true })
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
    const fileContent = await fs.readFile(INGREDIENT_LEVELS_FILE, "utf-8")
    const levels = JSON.parse(fileContent)
    console.log("[v0] Füllstände aus Datei geladen:", levels.length)
    cachedIngredientLevels = levels
    return levels
  } catch (error) {
    console.log("[v0] Keine Füllstände-Datei gefunden, verwende Fallback")

    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("ingredient-levels")
        if (stored) {
          cachedIngredientLevels = JSON.parse(stored)
          return cachedIngredientLevels
        }
      }
    } catch (storageError) {
      console.error("[v0] Error loading from localStorage:", storageError)
    }
  }

  cachedIngredientLevels = [...defaultIngredientLevels]
  return cachedIngredientLevels
}

async function saveIngredientLevelsToFile(levels: IngredientLevel[]): Promise<void> {
  try {
    await ensureDataDirectory()
    await fs.writeFile(INGREDIENT_LEVELS_FILE, JSON.stringify(levels, null, 2), "utf-8")
    console.log("[v0] Füllstände erfolgreich in Datei gespeichert:", levels.length)

    if (typeof window !== "undefined") {
      localStorage.setItem("ingredient-levels", JSON.stringify(levels))
    }

    cachedIngredientLevels = levels
  } catch (error) {
    console.error("[v0] Error saving ingredient levels to file:", error)

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("ingredient-levels", JSON.stringify(levels))
        console.log("[v0] Füllstände als Fallback in localStorage gespeichert")
      }
      cachedIngredientLevels = levels
    } catch (storageError) {
      console.error("[v0] Error saving to localStorage fallback:", storageError)
    }
  }
}

export async function GET() {
  try {
    let levels = await getIngredientLevelsFromFile()

    if (levels.length === 0 && typeof window !== "undefined") {
      const backup = localStorage.getItem("ingredient-levels-backup")
      if (backup) {
        try {
          const backupData = JSON.parse(backup)
          if (backupData.levels && Array.isArray(backupData.levels)) {
            console.log("[v0] Wiederherstellung von Backup-Füllständen beim Start")
            levels = backupData.levels
            await saveIngredientLevelsToFile(levels)
            localStorage.removeItem("ingredient-levels-backup")
          }
        } catch (error) {
          console.error("[v0] Fehler beim Wiederherstellen der Backup-Daten:", error)
        }
      }
    }

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
