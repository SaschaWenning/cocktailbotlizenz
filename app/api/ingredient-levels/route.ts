import { type NextRequest, NextResponse } from "next/server"

let ingredientLevels: any[] = []

// GET - Load ingredient levels from memory
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      levels: ingredientLevels.map((level: any) => ({
        ...level,
        lastUpdated: new Date(level.lastUpdated),
      })),
    })
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

// POST - Save ingredient levels to memory
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

    ingredientLevels = levels

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving ingredient levels:", error)
    return NextResponse.json({ error: "Failed to save ingredient levels" }, { status: 500 })
  }
}
