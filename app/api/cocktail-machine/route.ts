import { type NextRequest, NextResponse } from "next/server"
import {
  makeCocktail,
  makeSingleShot,
  getAllCocktails,
  saveRecipe,
  deleteRecipe,
  getPumpConfig,
  savePumpConfig,
  calibratePump,
  cleanPump,
} from "@/lib/cocktail-machine"

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json()

    switch (action) {
      case "makeCocktail":
        const result = await makeCocktail(params.cocktail, params.pumpConfig, params.size)
        return NextResponse.json(result)

      case "makeSingleShot":
        const shotResult = await makeSingleShot(params.ingredientId, params.amount)
        return NextResponse.json(shotResult)

      case "getAllCocktails":
        const cocktails = await getAllCocktails()
        return NextResponse.json(cocktails)

      case "saveRecipe":
        const saveResult = await saveRecipe(params.cocktail)
        return NextResponse.json(saveResult)

      case "deleteRecipe":
        const deleteResult = await deleteRecipe(params.cocktailId)
        return NextResponse.json(deleteResult)

      case "getPumpConfig":
        const config = await getPumpConfig()
        return NextResponse.json(config)

      case "savePumpConfig":
        const saveConfigResult = await savePumpConfig(params.pumpConfig)
        return NextResponse.json(saveConfigResult)

      case "calibratePump":
        const calibrateResult = await calibratePump(params.pumpId, params.durationMs)
        return NextResponse.json(calibrateResult)

      case "cleanPump":
        const cleanResult = await cleanPump(params.pumpId, params.durationMs)
        return NextResponse.json(cleanResult)

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
