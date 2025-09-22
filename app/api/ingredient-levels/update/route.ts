import { type NextRequest, NextResponse } from "next/server"

interface IngredientLevel {
  pumpId: number
  ingredient: string
  ingredientId: string
  currentLevel: number
  containerSize: number
  lastUpdated: string
}

const ingredientLevels: IngredientLevel[] = []

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json()

    // Aktualisiere die Levels
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
