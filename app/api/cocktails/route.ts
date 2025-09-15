import { NextResponse } from "next/server"
import { getAllCocktails } from "@/lib/cocktail-machine-server"

export async function GET() {
  try {
    const cocktails = await getAllCocktails()
    return NextResponse.json({ success: true, cocktails })
  } catch (error) {
    console.error("Error getting cocktails:", error)
    return NextResponse.json({ success: false, error: "Failed to get cocktails" }, { status: 500 })
  }
}
