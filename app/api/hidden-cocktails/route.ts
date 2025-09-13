import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

let hiddenCocktailsCache: string[] = []
let isInitialized = false

const initializeHiddenCocktails = (): void => {
  if (!isInitialized) {
    hiddenCocktailsCache = []
    isInitialized = true
    console.log("[v0] Hidden Cocktails initialisiert mit", hiddenCocktailsCache.length, "versteckten Cocktails")
  }
}

export async function GET() {
  try {
    initializeHiddenCocktails()
    console.log("[v0] Hidden cocktails GET request, returning cache:", hiddenCocktailsCache)
    return NextResponse.json({ hiddenCocktails: hiddenCocktailsCache })
  } catch (error) {
    console.error("Error reading hidden cocktails:", error)
    return NextResponse.json({ hiddenCocktails: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { hiddenCocktails } = await request.json()
    console.log("[v0] Hidden cocktails POST request, saving:", hiddenCocktails)

    hiddenCocktailsCache = hiddenCocktails || []

    return NextResponse.json({
      success: true,
      hiddenCocktails: hiddenCocktailsCache,
    })
  } catch (error) {
    console.error("Error saving hidden cocktails:", error)
    return NextResponse.json({ error: "Failed to save hidden cocktails" }, { status: 500 })
  }
}
