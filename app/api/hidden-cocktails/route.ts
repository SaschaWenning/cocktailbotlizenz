import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

// Persist inside the app directory, regardless of deployment path
const DATA_DIR = path.join(process.cwd(), "data")
const HIDDEN_COCKTAILS_FILE = path.join(DATA_DIR, "hidden-cocktails.json")

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function readHidden(): string[] {
  try {
    ensureDir()
    if (!fs.existsSync(HIDDEN_COCKTAILS_FILE)) return []
    const raw = fs.readFileSync(HIDDEN_COCKTAILS_FILE, "utf8")
    const val = JSON.parse(raw)
    return Array.isArray(val) ? val : (val?.hiddenCocktails ?? [])
  } catch {
    return []
  }
}

function writeHidden(list: string[]) {
  ensureDir()
  fs.writeFileSync(HIDDEN_COCKTAILS_FILE, JSON.stringify(list, null, 2), "utf8")
}

export async function GET() {
  const list = readHidden()
  return NextResponse.json({ success: true, hiddenCocktails: list })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const list = Array.isArray(body) ? body : (body?.hiddenCocktails ?? [])
    if (!Array.isArray(list)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 })
    }
    writeHidden(list)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to save hidden cocktails" }, { status: 500 })
  }
}
