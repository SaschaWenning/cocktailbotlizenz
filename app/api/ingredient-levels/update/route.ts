import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const LEVELS_FILE_PATH = path.join(process.cwd(), "data", "ingredient-levels.json")

interface IngredientLevel {
  pumpId: number
  ingredient: string
  ingredientId: string
  currentLevel: number
  containerSize: number
  lastUpdated: string
}

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json()

    // Lade aktuelle Levels
    let levels: IngredientLevel[] = []
    if (fs.existsSync(LEVELS_FILE_PATH)) {
      const data = fs.readFileSync(LEVELS_FILE_PATH, "utf8")
      levels = JSON.parse(data)
    }

    // Aktualisiere die Levels
    for (const ingredient of ingredients) {
      const levelIndex = levels.findIndex((l) => l.pumpId === ingredient.pumpId)
      if (levelIndex !== -1) {
        levels[levelIndex].currentLevel = Math.max(0, levels[levelIndex].currentLevel - ingredient.amount)
        levels[levelIndex].lastUpdated = new Date().toISOString()
      }
    }

    // Speichere die aktualisierten Levels
    fs.mkdirSync(path.dirname(LEVELS_FILE_PATH), { recursive: true })
    fs.writeFileSync(LEVELS_FILE_PATH, JSON.stringify(levels, null, 2), "utf8")

    return NextResponse.json({
      success: true,
      levels: levels.map((level) => ({
        pumpId: level.pumpId,
        ingredient: level.ingredient,
        ingredientId: level.ingredientId,
        currentLevel: level.currentLevel,
        containerSize: level.containerSize,
        lastUpdated: new Date(level.lastUpdated),
      })),
    })
  } catch (error) {
    console.error("Error updating ingredient levels:", error)
    return NextResponse.json({ error: "Failed to update levels" }, { status: 500 })
  }
}
