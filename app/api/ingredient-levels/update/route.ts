import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "data", "ingredient-levels.json")

interface IngredientLevel {
  pumpId: number
  ingredient: string
  ingredientId: string
  currentLevel: number
  containerSize: number
  lastUpdated: string
}

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDataDir()
    const { ingredients } = await request.json()

    // Load current levels
    let ingredientLevels: IngredientLevel[] = []
    try {
      const data = await fs.readFile(DATA_FILE, "utf-8")
      ingredientLevels = JSON.parse(data)
    } catch {
      // File doesn't exist, start with empty array
      ingredientLevels = []
    }

    // Update the levels
    for (const ingredient of ingredients) {
      const levelIndex = ingredientLevels.findIndex((l) => l.pumpId === ingredient.pumpId)
      if (levelIndex !== -1) {
        ingredientLevels[levelIndex].currentLevel = Math.max(
          0,
          ingredientLevels[levelIndex].currentLevel - ingredient.amount,
        )
        ingredientLevels[levelIndex].lastUpdated = new Date().toISOString()
      }
    }

    // Save updated levels
    await fs.writeFile(DATA_FILE, JSON.stringify(ingredientLevels, null, 2))

    return NextResponse.json({
      success: true,
      levels: ingredientLevels.map((level) => ({
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
