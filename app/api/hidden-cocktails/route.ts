import { type NextRequest, NextResponse } from "next/server"
import { loadHiddenCocktails, saveHiddenCocktails } from "@/lib/persistent-storage"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const hiddenCocktails = await loadHiddenCocktails()
    return NextResponse.json({ success: true, hiddenCocktails })
  } catch (error) {
    console.error("Error loading hidden cocktails:", error)
    return NextResponse.json({ success: true, hiddenCocktails: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const list = Array.isArray(body) ? body : (body?.hiddenCocktails ?? [])
    if (!Array.isArray(list)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 })
    }
    await saveHiddenCocktails(list)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving hidden cocktails:", error)
    return NextResponse.json({ success: false, error: "Failed to save hidden cocktails" }, { status: 500 })
  }
}
