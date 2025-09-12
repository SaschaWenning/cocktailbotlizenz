import { type NextRequest, NextResponse } from "next/server"
import path from "path"
import type { IngredientLevel } from "@/types/ingredient-level"

const RASPBERRY_PI_DATA_DIR = "/home/pi/cocktailbot/cocktailbot-main/data"
const INGREDIENT_LEVELS_FILE = path.join(RASPBERRY_PI_DATA_DIR, "ingredient-levels-data.json")

let cachedIngredientLevels: IngredientLevel[] | null = null

async function getFileSystem() {
  try {
    const fs = await import("fs/promises")
    return fs
  } catch (error) {
    console.log("[v0] Dateisystem nicht verfügbar, verwende localStorage Fallback")
    return null
  }
}

async function ensureDataDirectory(): Promise<void> {
  try {
    const fs = await getFileSystem()
    if (fs) {
      await fs.mkdir(RASPBERRY_PI_DATA_DIR, { recursive: true })
    }
  } catch (error) {
    console.error("[v0] Error creating data directory:", error)
  }
}

async function isFirstRun(): Promise<boolean> {
  try {
    const fs = await getFileSystem()
    if (!fs) return true // Kein Dateisystem = erster Start

    await fs.access(INGREDIENT_LEVELS_FILE)
    return false // Datei existiert, nicht der erste Start
  } catch {
    return true // Datei existiert nicht, erster Start
  }
}

async function getInitialIngredientLevels(): Promise<IngredientLevel[]> {
  try {
    // Dynamischer Import um Circular Dependencies zu vermeiden
    const { initialIngredientLevels } = await import("@/data/ingredient-levels")
    return [...initialIngredientLevels]
  } catch (error) {
    console.error("[v0] Error loading initial ingredient levels:", error)
    return []
  }
}

async function getIngredientLevelsFromFile(): Promise<IngredientLevel[]> {
  if (cachedIngredientLevels !== null) {
    return cachedIngredientLevels
  }

  try {
    await ensureDataDirectory()
    const fs = await getFileSystem()

    const firstRun = await isFirstRun()

    if (firstRun) {
      console.log("[v0] Erster Start erkannt - lade Standardwerte für Füllstände")
      const initialLevels = await getInitialIngredientLevels()

      // Speichere die Standardwerte sofort für zukünftige Starts
      if (initialLevels.length > 0) {
        await saveIngredientLevelsToFile(initialLevels)
        console.log("[v0] Standardwerte für ersten Start gespeichert:", initialLevels.length)
      }

      cachedIngredientLevels = initialLevels
      return initialLevels
    }

    if (fs) {
      const fileContent = await fs.readFile(INGREDIENT_LEVELS_FILE, "utf-8")
      const levels = JSON.parse(fileContent)
      console.log("[v0] Gespeicherte Füllstände aus Datei geladen:", levels.length)
      cachedIngredientLevels = levels
      return levels
    } else {
      throw new Error("Dateisystem nicht verfügbar")
    }
  } catch (error) {
    console.log("[v0] Fehler beim Laden der Füllstände-Datei:", error)

    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("ingredient-levels")
        if (stored) {
          const levels = JSON.parse(stored)
          console.log("[v0] Füllstände aus localStorage Fallback geladen:", levels.length)
          cachedIngredientLevels = levels
          return levels
        }
      }
    } catch (storageError) {
      console.error("[v0] Error loading from localStorage:", storageError)
    }

    console.log("[v0] Verwende Standardwerte als letzten Fallback")
    const initialLevels = await getInitialIngredientLevels()
    cachedIngredientLevels = initialLevels
    return initialLevels
  }
}

async function saveIngredientLevelsToFile(levels: IngredientLevel[]): Promise<void> {
  try {
    await ensureDataDirectory()
    const fs = await getFileSystem()

    if (fs) {
      await fs.writeFile(INGREDIENT_LEVELS_FILE, JSON.stringify(levels, null, 2), "utf-8")
      console.log("[v0] Füllstände erfolgreich in Datei gespeichert:", levels.length)
    } else {
      console.log("[v0] Dateisystem nicht verfügbar, verwende nur localStorage")
    }

    // Immer auch localStorage als Backup verwenden
    if (typeof window !== "undefined") {
      localStorage.setItem("ingredient-levels", JSON.stringify(levels))
      console.log("[v0] Füllstände auch in localStorage gespeichert")
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
      throw new Error("Konnte Füllstände nicht speichern")
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
    const initialLevels = await getInitialIngredientLevels()
    return NextResponse.json(initialLevels)
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
