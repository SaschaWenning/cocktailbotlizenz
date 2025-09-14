import { type NextRequest, NextResponse } from "next/server"
import { saveRecipe } from "@/lib/cocktail-machine"
import type { Cocktail } from "@/types/cocktail"

export async function POST(request: NextRequest) {
  try {
    const cocktail: Cocktail = await request.json()

    const result = await saveRecipe(cocktail)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error saving recipe:", error)
    return NextResponse.json({ success: false, error: "Failed to save recipe" }, { status: 500 })
  }
}
