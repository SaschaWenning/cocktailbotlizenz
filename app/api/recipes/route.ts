import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const FILE = path.join(DATA_DIR, "recipes.json")

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export async function GET() {
  try {
    ensureDir()
    if (!fs.existsSync(FILE)) {
      return NextResponse.json({ success: true, recipes: [] })
    }
    const raw = fs.readFileSync(FILE, "utf8")
    const recipes = JSON.parse(raw)
    return NextResponse.json({ success: true, recipes })
  } catch (e) {
    console.error("GET /api/recipes failed:", e)
    return NextResponse.json({ success: false, error: "Failed to read recipes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const recipes = Array.isArray(body) ? body : body.recipes
    if (!Array.isArray(recipes)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 })
    }
    ensureDir()
    fs.writeFileSync(FILE, JSON.stringify(recipes, null, 2), "utf8")
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("POST /api/recipes failed:", e)
    return NextResponse.json({ success: false, error: "Failed to save recipes" }, { status: 500 })
  }
}
