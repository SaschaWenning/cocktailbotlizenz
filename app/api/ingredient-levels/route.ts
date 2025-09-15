import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const FILE_PATH = path.join(DATA_DIR, "ingredient-levels.json")

// Ensure data directory exists
const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// GET - Load ingredient levels from file
export async function GET() {
  try {
    ensureDataDir()

    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, "utf8")
      const parsed = JSON.parse(raw)
      // Backward-compat: file might be { levels: [...] } or direct array
      const levels = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.levels) ? parsed.levels : []

      return NextResponse.json({
        success: true,
        levels: levels.map((level: any) => ({
          ...level,
          lastUpdated: new Date(level.lastUpdated),
        })),
      })
    }

    // If file doesn't exist, return empty array
    return NextResponse.json({ success: true, levels: [] })
  } catch (error) {
    console.error("[v0] Error loading ingredient levels:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load ingredient levels",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// POST - Save ingredient levels to file
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const levels = Array.isArray(body) ? body : Array.isArray(body?.levels) ? body.levels : null

    if (!levels) {
      return NextResponse.json(
        { success: false, message: "Invalid body: expected array or { levels: [] }" },
        { status: 400 },
      )
    }

    ensureDataDir()
    fs.writeFileSync(FILE_PATH, JSON.stringify(levels, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving ingredient levels:", error)
    return NextResponse.json({ error: "Failed to save ingredient levels" }, { status: 500 })
  }
}
