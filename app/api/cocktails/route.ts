import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import { join } from "path"
import type { Cocktail } from "@/types/cocktail"
import { cocktails as defaultCocktails } from "@/data/cocktails"

const DATA_DIR = "data"
const COCKTAILS_FILE = join(DATA_DIR, "cocktails.json")
const DELETED_COCKTAILS_FILE = join(DATA_DIR, "deleted-cocktails.json")

let cachedCocktails: Cocktail[] | null = null
let cachedDeletedIds: string[] | null = null

async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    console.error("[v0] Error creating data directory:", error)
  }
}

async function getDeletedCocktailIds(): Promise<string[]> {
  if (cachedDeletedIds !== null) {
    return cachedDeletedIds
  }

  try {
    await ensureDataDirectory()
    const data = await fs.readFile(DELETED_COCKTAILS_FILE, "utf-8")
    cachedDeletedIds = JSON.parse(data)
    console.log("[v0] Loaded deleted cocktail IDs from file:", cachedDeletedIds.length)
    return cachedDeletedIds
  } catch (error) {
    console.log("[v0] No deleted cocktails file found, using empty array")

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("deleted-cocktails")
        if (stored) {
          cachedDeletedIds = JSON.parse(stored)
          return cachedDeletedIds
        }
      } catch (localError) {
        console.error("[v0] Error loading deleted IDs from localStorage:", localError)
      }
    }

    cachedDeletedIds = []
    return cachedDeletedIds
  }
}

async function saveDeletedCocktailIds(deletedIds: string[]): Promise<void> {
  try {
    await ensureDataDirectory()
    await fs.writeFile(DELETED_COCKTAILS_FILE, JSON.stringify(deletedIds, null, 2))
    cachedDeletedIds = deletedIds
    console.log("[v0] Saved deleted cocktail IDs to file:", deletedIds.length)
  } catch (error) {
    console.error("[v0] Error saving deleted cocktail IDs to file:", error)

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("deleted-cocktails", JSON.stringify(deletedIds))
        cachedDeletedIds = deletedIds
        console.log("[v0] Saved deleted IDs to localStorage as fallback")
      } catch (localError) {
        console.error("[v0] Error saving deleted IDs to localStorage:", localError)
      }
    }
  }
}

async function getCocktailsFromFile(): Promise<Cocktail[]> {
  if (cachedCocktails !== null) {
    return cachedCocktails
  }

  try {
    await ensureDataDirectory()
    const data = await fs.readFile(COCKTAILS_FILE, "utf-8")
    cachedCocktails = JSON.parse(data)
    console.log("[v0] Loaded cocktails from file:", cachedCocktails.length)
    return cachedCocktails
  } catch (error) {
    console.log("[v0] No cocktails file found, using defaults")

    // Verwende Standard-Cocktails und filtere gelöschte heraus
    const deletedIds = await getDeletedCocktailIds()
    cachedCocktails = defaultCocktails
      .filter((cocktail) => !deletedIds.includes(cocktail.id))
      .map((cocktail) => ({
        ...cocktail,
        recipe: cocktail.recipe.map((item) => ({
          ...item,
          type: (item as any).type || "automatic",
          instruction: (item as any).instruction || "",
        })),
      }))

    return cachedCocktails
  }
}

async function saveCocktailsToFile(cocktails: Cocktail[]): Promise<void> {
  try {
    await ensureDataDirectory()
    await fs.writeFile(COCKTAILS_FILE, JSON.stringify(cocktails, null, 2))
    cachedCocktails = cocktails
    console.log("[v0] Saved cocktails to file:", cocktails.length)
  } catch (error) {
    console.error("[v0] Error saving cocktails to file:", error)
  }
}

export async function GET() {
  try {
    const cocktails = await getCocktailsFromFile()
    console.log("[v0] Returning cocktails:", cocktails.length)
    return NextResponse.json(cocktails)
  } catch (error) {
    console.error("[v0] Error in cocktails GET:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, cocktail, cocktailId } = await request.json()

    if (action === "save") {
      const cocktails = await getCocktailsFromFile()
      const index = cocktails.findIndex((c) => c.id === cocktail.id)

      if (index > -1) {
        cocktails[index] = cocktail
        console.log(`[v0] Updated cocktail: ${cocktail.name}`)
      } else {
        cocktails.push(cocktail)
        console.log(`[v0] Added new cocktail: ${cocktail.name}`)
      }

      await saveCocktailsToFile(cocktails)
      return NextResponse.json({ success: true })
    } else if (action === "delete") {
      const deletedIds = await getDeletedCocktailIds()
      if (!deletedIds.includes(cocktailId)) {
        deletedIds.push(cocktailId)
        await saveDeletedCocktailIds(deletedIds)
      }

      // Entferne auch aus der aktuellen Cocktail-Liste
      const cocktails = await getCocktailsFromFile()
      const filteredCocktails = cocktails.filter((c) => c.id !== cocktailId)
      await saveCocktailsToFile(filteredCocktails)

      console.log(`[v0] Deleted cocktail with ID: ${cocktailId}`)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error in cocktails POST:", error)
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 })
  }
}
