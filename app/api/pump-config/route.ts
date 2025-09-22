import { type NextRequest, NextResponse } from "next/server"
import type { PumpConfig } from "@/types/pump"

let pumpConfig: PumpConfig[] = [
  { id: 1, ingredient: "Vodka", ingredientId: "vodka", mlPerSecond: 10, isActive: true },
  { id: 2, ingredient: "Rum", ingredientId: "rum", mlPerSecond: 10, isActive: true },
  { id: 3, ingredient: "Gin", ingredientId: "gin", mlPerSecond: 10, isActive: true },
  { id: 4, ingredient: "Tequila", ingredientId: "tequila", mlPerSecond: 10, isActive: true },
  { id: 5, ingredient: "Whiskey", ingredientId: "whiskey", mlPerSecond: 10, isActive: true },
  { id: 6, ingredient: "Brandy", ingredientId: "brandy", mlPerSecond: 10, isActive: true },
]

export async function GET() {
  try {
    return NextResponse.json({ success: true, pumpConfig })
  } catch (error) {
    console.error("Error getting pump config:", error)
    return NextResponse.json({ success: false, error: "Failed to get pump config" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pumpConfig: newConfig } = await request.json()
    pumpConfig = newConfig
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving pump config:", error)
    return NextResponse.json({ success: false, error: "Failed to save pump config" }, { status: 500 })
  }
}
