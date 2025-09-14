import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"

export const dynamic = "force-dynamic"

const HIDDEN_COCKTAILS_FILE = "/home/pi/cocktailbot/cocktailbot-main/data/hidden-cocktails.json"

let hiddenCocktailsCache: string[] = []
let isInitialized = false

async function initializeHiddenCocktails() {
  if (isInitialized) return

  try {
    console.log("[v0] Versuche Hidden Cocktails aus Datei zu laden:", HIDDEN_COCKTAILS_FILE)

    const data = await fs.promises.readFile(HIDDEN_COCKTAILS_FILE, "utf8")
    const parsed = JSON.parse(data)
    hiddenCocktailsCache = parsed.hiddenCocktails || []
    console.log("[v0] Hidden Cocktails aus Datei geladen:", hiddenCocktailsCache.length)
  } catch (error) {
    console.log("[v0] Dateisystem nicht verfügbar für Hidden Cocktails:", error.message)

    // Fallback to localStorage (for v0 preview)
    if (typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem("hidden-cocktails")
        if (stored) {
          hiddenCocktailsCache = JSON.parse(stored)
          console.log("[v0] Hidden Cocktails aus localStorage geladen:", hiddenCocktailsCache.length)
        }
      } catch (e) {
        console.log("[v0] Fehler beim Laden aus localStorage:", e.message)
      }
    }
  }

  isInitialized = true
}

async function saveHiddenCocktails(hiddenCocktails: string[]) {
  // Update cache
  hiddenCocktailsCache = hiddenCocktails

  try {
    const data = { hiddenCocktails }
    await fs.promises.writeFile(HIDDEN_COCKTAILS_FILE, JSON.stringify(data, null, 2))
    console.log("[v0] Hidden Cocktails in Datei gespeichert:", hiddenCocktails.length)
  } catch (error) {
    console.log("[v0] Dateisystem nicht verfügbar, verwende nur localStorage")
  }

  // Always save to localStorage as fallback
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem("hidden-cocktails", JSON.stringify(hiddenCocktails))
      console.log("[v0] Hidden Cocktails auch in localStorage gespeichert")
    } catch (e) {
      console.log("[v0] Fehler beim Speichern in localStorage:", e.message)
    }
  }
}

export async function GET() {
  try {
    await initializeHiddenCocktails()
    console.log("[v0] Hidden cocktails GET request, returning cache:", hiddenCocktailsCache.length)
    return NextResponse.json({ hiddenCocktails: hiddenCocktailsCache })
  } catch (error) {
    console.error("Error reading hidden cocktails:", error)
    return NextResponse.json({ hiddenCocktails: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { hiddenCocktails } = await request.json()
    console.log("[v0] Hidden cocktails POST request, saving:", hiddenCocktails?.length || 0)

    await saveHiddenCocktails(hiddenCocktails || [])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving hidden cocktails:", error)
    return NextResponse.json({ error: "Failed to save hidden cocktails" }, { status: 500 })
  }
}
