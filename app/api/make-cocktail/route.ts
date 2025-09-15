import { type NextRequest, NextResponse } from "next/server"
import { makeCocktailAction } from "@/lib/cocktail-machine-server"

export async function POST(request: NextRequest) {
  try {
    const { cocktail, pumpConfig, size } = await request.json()
    const result = await makeCocktailAction(cocktail, pumpConfig, size)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error making cocktail:", error)
    return NextResponse.json({ success: false, error: "Failed to make cocktail" }, { status: 500 })
  }
}
