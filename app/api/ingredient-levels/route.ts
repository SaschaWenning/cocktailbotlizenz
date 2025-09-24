import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "data", "ingredient-levels.json")

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

export async function GET() {
  try {
    await ensureDataDir()
    const data = await fs.readFile(DATA_FILE, "utf-8")
    const levels = JSON.parse(data)

    return NextResponse.json({
      success: true,
      levels: levels.map((level: any) => ({
        ...level,
        lastUpdated: new Date(level.lastUpdated),
      })),
    })
  } catch (error) {
    // File doesn't exist or is invalid, return empty array
    return NextResponse.json({
      success: true,
      levels: [],
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDataDir()
    const body = await request.json()
    const levels = Array.isArray(body) ? body : Array.isArray(body?.levels) ? body.levels : null

    if (!levels) {
      return NextResponse.json(
        { success: false, message: "Invalid body: expected array or { levels: [] }" },
        { status: 400 },
      )
    }

    // Convert dates to strings for JSON storage
    const levelsForStorage = levels.map((level: any) => ({
      ...level,
      lastUpdated: level.lastUpdated instanceof Date ? level.lastUpdated.toISOString() : level.lastUpdated,
    }))

    await fs.writeFile(DATA_FILE, JSON.stringify(levelsForStorage, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving ingredient levels:", error)
    return NextResponse.json({ error: "Failed to save ingredient levels" }, { status: 500 })
  }
}
