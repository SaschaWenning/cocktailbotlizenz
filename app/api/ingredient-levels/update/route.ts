import { type NextRequest, NextResponse } from "next/server"
import { updateIngredientLevel } from "@/lib/ingredient-level-service"

export async function POST(request: NextRequest) {
  try {
    const { ingredientId, amount, capacity } = await request.json()

    if (!ingredientId || amount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedLevel = await updateIngredientLevel(ingredientId, amount, capacity)
    return NextResponse.json(updatedLevel)
  } catch (error) {
    console.error("Error updating ingredient level:", error)
    return NextResponse.json({ error: "Failed to update ingredient level" }, { status: 500 })
  }
}
