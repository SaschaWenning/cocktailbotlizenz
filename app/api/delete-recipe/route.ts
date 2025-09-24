import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const COCKTAILS_PATH = path.join(process.cwd(), "data", "custom-cocktails.json")

export async function POST(request: NextRequest) {
  try {
    const { cocktailId } = await request.json()

    if (!cocktailId) {
      return NextResponse.json({ success: false, error: "Cocktail ID is required" }, { status: 400 })
    }

    console.log(`[v0] Deleting cocktail: ${cocktailId}`)

    let customCocktails: any[] = []
    if (fs.existsSync(COCKTAILS_PATH)) {
      const data = fs.readFileSync(COCKTAILS_PATH, "utf8")
      customCocktails = JSON.parse(data)
    }

    const originalLength = customCocktails.length
    customCocktails = customCocktails.filter((c) => c.id !== cocktailId)

    if (customCocktails.length === originalLength) {
      console.log(`[v0] Cocktail ${cocktailId} not found in custom cocktails`)
      return NextResponse.json({ success: false, error: "Cocktail not found" }, { status: 404 })
    }

    fs.mkdirSync(path.dirname(COCKTAILS_PATH), { recursive: true })
    fs.writeFileSync(COCKTAILS_PATH, JSON.stringify(customCocktails, null, 2), "utf8")

    console.log(`[v0] Cocktail ${cocktailId} successfully deleted`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting recipe:", error)
    return NextResponse.json({ success: false, error: "Failed to delete recipe" }, { status: 500 })
  }
}
