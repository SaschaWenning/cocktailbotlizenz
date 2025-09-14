import { NextResponse } from "next/server"
import { refillAllIngredients } from "@/lib/ingredient-level-service"

export async function POST() {
  try {
    const updatedLevels = await refillAllIngredients()
    return NextResponse.json(updatedLevels)
  } catch (error) {
    console.error("Error refilling all ingredients:", error)
    return NextResponse.json({ error: "Failed to refill all ingredients" }, { status: 500 })
  }
}
