import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

interface CocktailStat {
  cocktailId: string
  cocktailName: string
  count: number
}

interface IngredientUsage {
  ingredientId: string
  ingredientName: string
  totalMl: number
  price: number
}

interface IngredientPrice {
  ingredientId: string
  ingredientName: string
  pricePerLiter: number
}

interface Statistics {
  cocktails: CocktailStat[]
  ingredients: IngredientUsage[]
  ingredientPrices: IngredientPrice[]
  lastUpdated: string
}

const getStatisticsFile = async () => {
  const dataDir = path.join(process.cwd(), "data")
  const statsFile = path.join(dataDir, "statistics.json")

  try {
    const data = await fs.readFile(statsFile, "utf-8")
    return JSON.parse(data) as Statistics
  } catch {
    // Falls Datei nicht existiert, erstelle Standard-Statistiken
    return {
      cocktails: [],
      ingredients: [],
      ingredientPrices: [],
      lastUpdated: new Date().toISOString(),
    }
  }
}

const saveStatistics = async (stats: Statistics) => {
  const dataDir = path.join(process.cwd(), "data")
  const statsFile = path.join(dataDir, "statistics.json")

  try {
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(statsFile, JSON.stringify(stats, null, 2))
  } catch (error) {
    console.error("[v0] Error saving statistics:", error)
    throw error
  }
}

export async function GET() {
  try {
    const stats = await getStatisticsFile()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Error reading statistics:", error)
    return NextResponse.json({ error: "Failed to read statistics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    const stats = await getStatisticsFile()

    switch (action) {
      case "addCocktail": {
        const { cocktailId, cocktailName, ingredients } = data
        const existingCocktail = stats.cocktails.find((c) => c.cocktailId === cocktailId)

        if (existingCocktail) {
          existingCocktail.count++
        } else {
          stats.cocktails.push({
            cocktailId,
            cocktailName,
            count: 1,
          })
        }

        // Aktualisiere Zutatenverbrauch
        for (const ingredient of ingredients) {
          const existingIngredient = stats.ingredients.find((i) => i.ingredientId === ingredient.ingredientId)

          if (existingIngredient) {
            existingIngredient.totalMl += ingredient.amount
          } else {
            stats.ingredients.push({
              ingredientId: ingredient.ingredientId,
              ingredientName: ingredient.ingredientName,
              totalMl: ingredient.amount,
              price: 0,
            })
          }
        }

        stats.lastUpdated = new Date().toISOString()
        await saveStatistics(stats)

        return NextResponse.json({ success: true, stats })
      }

      case "setIngredientPrice": {
        const { ingredientId, ingredientName, pricePerLiter } = data

        const existingPrice = stats.ingredientPrices.find((p) => p.ingredientId === ingredientId)

        if (existingPrice) {
          existingPrice.pricePerLiter = pricePerLiter
          existingPrice.ingredientName = ingredientName
        } else {
          stats.ingredientPrices.push({
            ingredientId,
            ingredientName,
            pricePerLiter,
          })
        }

        // Aktualisiere auch die price in ingredients
        const ingredientUsage = stats.ingredients.find((i) => i.ingredientId === ingredientId)
        if (ingredientUsage) {
          ingredientUsage.price = (ingredientUsage.totalMl / 1000) * pricePerLiter
        }

        stats.lastUpdated = new Date().toISOString()
        await saveStatistics(stats)

        return NextResponse.json({ success: true, stats })
      }

      case "reset": {
        const newStats: Statistics = {
          cocktails: [],
          ingredients: [],
          ingredientPrices: stats.ingredientPrices, // Behalte die Preise
          lastUpdated: new Date().toISOString(),
        }
        await saveStatistics(newStats)
        return NextResponse.json({ success: true, stats: newStats })
      }

      case "resetWithPrices": {
        // Behalte Preise und initialisiere Zutaten mit den aktuellen Preisen
        const newStats: Statistics = {
          cocktails: [],
          ingredients: stats.ingredientPrices.map((p) => ({
            ingredientId: p.ingredientId,
            ingredientName: p.ingredientName,
            totalMl: 0,
            price: 0,
          })),
          ingredientPrices: stats.ingredientPrices,
          lastUpdated: new Date().toISOString(),
        }
        await saveStatistics(newStats)
        return NextResponse.json({ success: true, stats: newStats })
      }

      case "updateIngredients": {
        const { ingredients } = data
        // Aktualisiere die Zutatenliste basierend auf verfügbaren Zutaten
        const currentPrices = new Map(stats.ingredientPrices.map((p) => [p.ingredientId, p.pricePerLiter]))

        const newIngredients: IngredientUsage[] = []

        // Behalte bestehende Einträge für Zutaten, die noch verwendet werden
        for (const ing of ingredients) {
          const existing = stats.ingredients.find((i) => i.ingredientId === ing.id)
          if (existing) {
            newIngredients.push(existing)
          } else {
            newIngredients.push({
              ingredientId: ing.id,
              ingredientName: ing.name,
              totalMl: 0,
              price: 0,
            })
          }
        }

        stats.ingredients = newIngredients

        // Aktualisiere auch die Preise
        const newPrices: IngredientPrice[] = []
        for (const ing of ingredients) {
          const existing = stats.ingredientPrices.find((p) => p.ingredientId === ing.id)
          if (existing) {
            newPrices.push(existing)
          } else {
            newPrices.push({
              ingredientId: ing.id,
              ingredientName: ing.name,
              pricePerLiter: 0,
            })
          }
        }

        stats.ingredientPrices = newPrices
        stats.lastUpdated = new Date().toISOString()
        await saveStatistics(stats)

        return NextResponse.json({ success: true, stats })
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Error processing statistics request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
