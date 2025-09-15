import { type NextRequest, NextResponse } from "next/server"
import { makeShotAction, getPumpConfig } from "@/lib/cocktail-machine-server"

export async function POST(request: NextRequest) {
  try {
    const { ingredient, size } = await request.json()

    const pumpConfig = await getPumpConfig()
    const result = await makeShotAction(ingredient, pumpConfig, size)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error making shot:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to make shot" },
      { status: 500 },
    )
  }
}
