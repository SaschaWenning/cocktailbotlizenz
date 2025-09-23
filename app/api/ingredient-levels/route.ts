import { type NextRequest, NextResponse } from "next/server"

interface IngredientLevel {
  pumpId: number
  ingredient: string
  ingredientId: string
  currentLevel: number
  containerSize: number
  lastUpdated: string
}

const getDefaultLevels = (): IngredientLevel[] => [
  {
    pumpId: 1,
    ingredient: "Vodka",
    ingredientId: "vodka",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 2,
    ingredient: "Rum",
    ingredientId: "rum",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 3,
    ingredient: "Gin",
    ingredientId: "gin",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 4,
    ingredient: "Tequila",
    ingredientId: "tequila",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 5,
    ingredient: "Whiskey",
    ingredientId: "whiskey",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 6,
    ingredient: "Cointreau",
    ingredientId: "cointreau",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 7,
    ingredient: "Peach Schnapps",
    ingredientId: "peach_schnapps",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 8,
    ingredient: "Blue Curacao",
    ingredientId: "blue_curacao",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 9,
    ingredient: "Grenadine",
    ingredientId: "grenadine",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 10,
    ingredient: "Lime Juice",
    ingredientId: "lime_juice",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 11,
    ingredient: "Lemon Juice",
    ingredientId: "lemon_juice",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 12,
    ingredient: "Simple Syrup",
    ingredientId: "simple_syrup",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 13,
    ingredient: "Cranberry Juice",
    ingredientId: "cranberry_juice",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 14,
    ingredient: "Pineapple Juice",
    ingredientId: "pineapple_juice",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 15,
    ingredient: "Orange Juice",
    ingredientId: "orange_juice",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 16,
    ingredient: "Coconut Cream",
    ingredientId: "coconut_cream",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 17,
    ingredient: "Amaretto",
    ingredientId: "amaretto",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
  {
    pumpId: 18,
    ingredient: "Kahlua",
    ingredientId: "kahlua",
    currentLevel: 100,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  },
]

const ingredientLevels: IngredientLevel[] = getDefaultLevels()

// GET - Load ingredient levels from memory
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      levels: ingredientLevels.map((level) => ({
        ...level,
        lastUpdated: new Date(level.lastUpdated),
      })),
    })
  } catch (error) {
    console.error("Error loading ingredient levels:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load ingredient levels",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// POST - Save ingredient levels to memory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const levels = Array.isArray(body) ? body : Array.isArray(body?.levels) ? body.levels : null

    if (!levels) {
      return NextResponse.json(
        { success: false, message: "Invalid body: expected array or { levels: [] }" },
        { status: 400 },
      )
    }

    ingredientLevels.splice(0, ingredientLevels.length, ...levels)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving ingredient levels:", error)
    return NextResponse.json({ error: "Failed to save ingredient levels" }, { status: 500 })
  }
}
