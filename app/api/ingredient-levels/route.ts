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
    console.log("[v0] GET ingredient-levels: Loading from", FILE_PATH)
    ensureDataDir()

    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, "utf8")
      const levels = JSON.parse(data)
      console.log("[v0] GET ingredient-levels: Loaded", levels.length, "levels")

      return NextResponse.json({
        success: true,
        levels: levels.map((level: any) => ({
          ...level,
          lastUpdated: new Date(level.lastUpdated),
        })),
      })
    }

    console.log("[v0] GET ingredient-levels: File doesn't exist, returning empty array")
    // Return empty array if file doesn't exist
    return NextResponse.json({ success: true, levels: [] })
  } catch (error) {
    console.error("[v0] Error loading ingredient levels:", error)
    return NextResponse.json({ success: false, error: "Failed to load ingredient levels" }, { status: 500 })
  }
}

// POST - Save ingredient levels to file
export async function POST(request: NextRequest) {
  try {
    const levels = await request.json()

    ensureDataDir()
    fs.writeFileSync(FILE_PATH, JSON.stringify(levels, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving ingredient levels:", error)
    return NextResponse.json({ error: "Failed to save ingredient levels" }, { status: 500 })
  }
}
