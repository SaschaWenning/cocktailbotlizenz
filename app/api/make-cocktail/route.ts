import { type NextRequest, NextResponse } from "next/server"
import { makeCocktail, getPumpConfig } from "@/lib/cocktail-machine"
import type { Cocktail } from "@/types/cocktail"

export async function POST(request: NextRequest) {
  try {
    const { cocktail, size }: { cocktail: Cocktail; size: number } = await request.json()
    const pumpConfig = await getPumpConfig()
    const result = await makeCocktail(cocktail, pumpConfig, size)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error making cocktail:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to make cocktail" },
      { status: 500 },
    )
  }
}
