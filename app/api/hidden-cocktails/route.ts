import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

let hiddenCocktailsCache: string[] = []
let isInitialized = false

// Funktion zum Laden der versteckten Cocktails aus localStorage
const loadHiddenCocktailsFromStorage = (): string[] => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("hidden-cocktails")
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("[v0] Fehler beim Laden der versteckten Cocktails aus localStorage:", error)
      return []
    }
  }
  return []
}

// Funktion zum Speichern der versteckten Cocktails in localStorage
const saveHiddenCocktailsToStorage = (hiddenCocktails: string[]): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("hidden-cocktails", JSON.stringify(hiddenCocktails))
      console.log("[v0] Versteckte Cocktails in localStorage gespeichert:", hiddenCocktails.length)
    } catch (error) {
      console.error("[v0] Fehler beim Speichern der versteckten Cocktails in localStorage:", error)
    }
  }
}

// Initialisierung nur einmal durchführen
const initializeHiddenCocktails = (): void => {
  if (!isInitialized) {
    hiddenCocktailsCache = loadHiddenCocktailsFromStorage()
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

    saveHiddenCocktailsToStorage(hiddenCocktailsCache)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving hidden cocktails:", error)
    return NextResponse.json({ error: "Failed to save hidden cocktails" }, { status: 500 })
  }
}
