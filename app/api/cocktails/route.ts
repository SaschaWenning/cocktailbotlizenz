import { NextResponse } from "next/server"
import { getAllCocktails } from "@/lib/cocktail-machine"

export async function GET() {
  try {
    const cocktails = await getAllCocktails()
    return NextResponse.json(cocktails)
  } catch (error) {
    console.error("Error loading cocktails:", error)
    return NextResponse.json({ error: "Failed to load cocktails" }, { status: 500 })
  }
}
