import { type NextRequest, NextResponse } from "next/server"
import { updateIngredientCapacity } from "@/lib/ingredient-level-service"

export async function POST(request: NextRequest) {
  try {
    const { ingredientId, capacity } = await request.json()

    if (!ingredientId || capacity === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedLevel = await updateIngredientCapacity(ingredientId, capacity)
    return NextResponse.json(updatedLevel)
  } catch (error) {
    console.error("Error updating ingredient capacity:", error)
    return NextResponse.json({ error: "Failed to update ingredient capacity" }, { status: 500 })
  }
}
