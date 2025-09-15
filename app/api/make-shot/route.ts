import { type NextRequest, NextResponse } from "next/server"
import { makeShotAction } from "@/lib/cocktail-machine-server"

export async function POST(request: NextRequest) {
  try {
    const { ingredient, pumpConfig, size } = await request.json()
    const result = await makeShotAction(ingredient, pumpConfig, size)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error making shot:", error)
    return NextResponse.json({ success: false, error: "Failed to make shot" }, { status: 500 })
  }
}
