import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

const HIDDEN_COCKTAILS_PATH = path.join(process.cwd(), "data", "hidden-cocktails.json")

function loadHiddenCocktails(): string[] {
  try {
    if (fs.existsSync(HIDDEN_COCKTAILS_PATH)) {
      const data = fs.readFileSync(HIDDEN_COCKTAILS_PATH, "utf8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error loading hidden cocktails:", error)
  }
  return []
}

function saveHiddenCocktails(hiddenCocktails: string[]): void {
  try {
    fs.mkdirSync(path.dirname(HIDDEN_COCKTAILS_PATH), { recursive: true })
    fs.writeFileSync(HIDDEN_COCKTAILS_PATH, JSON.stringify(hiddenCocktails, null, 2), "utf8")
    console.log(`[v0] Hidden cocktails saved: ${hiddenCocktails.length} items`)
  } catch (error) {
    console.error("Error saving hidden cocktails:", error)
    throw error
  }
}

export async function GET() {
  const hiddenCocktails = loadHiddenCocktails()
  return NextResponse.json({ success: true, hiddenCocktails })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const list = Array.isArray(body) ? body : (body?.hiddenCocktails ?? [])
    if (!Array.isArray(list)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 })
    }

    saveHiddenCocktails(list)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving hidden cocktails:", error)
    return NextResponse.json({ success: false, error: "Failed to save hidden cocktails" }, { status: 500 })
  }
}
