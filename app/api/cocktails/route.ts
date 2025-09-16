import { NextResponse } from "next/server"
import { getAllCocktails } from "@/lib/cocktail-machine-server"

export async function GET() {
  try {
    console.log("[v0] GET /api/cocktails - Loading all cocktails")
    const cocktails = await getAllCocktails()
    console.log("[v0] Returning", cocktails.length, "cocktails")
    return NextResponse.json({ success: true, cocktails })
  } catch (error) {
    console.error("[v0] Error getting cocktails:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to get cocktails: ${error.message}`,
        cocktails: [],
      },
      { status: 500 },
    )
  }
}
