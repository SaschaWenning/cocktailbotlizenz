import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const DEFAULT_SHOT_SIZES = [20, 40]
const SHOT_SIZES_PATH = path.join(process.cwd(), "data", "shot-sizes.json")

function loadShotSizes(): number[] {
  try {
    if (fs.existsSync(SHOT_SIZES_PATH)) {
      const data = fs.readFileSync(SHOT_SIZES_PATH, "utf8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error loading shot sizes:", error)
  }
  return DEFAULT_SHOT_SIZES
}

function saveShotSizes(sizes: number[]): void {
  try {
    fs.mkdirSync(path.dirname(SHOT_SIZES_PATH), { recursive: true })
    fs.writeFileSync(SHOT_SIZES_PATH, JSON.stringify(sizes, null, 2), "utf8")
    console.log(`[v0] Shot sizes saved: ${sizes}`)
  } catch (error) {
    console.error("Error saving shot sizes:", error)
    throw error
  }
}

export async function GET() {
  try {
    const shotSizes = loadShotSizes()
    return NextResponse.json({ shotSizes })
  } catch (error) {
    console.error("Error loading shot sizes:", error)
    return NextResponse.json({ shotSizes: DEFAULT_SHOT_SIZES })
  }
}

export async function POST(request: Request) {
  try {
    const { shotSizes } = await request.json()
    saveShotSizes(shotSizes)
    return NextResponse.json({ success: true, shotSizes })
  } catch (error) {
    console.error("Error saving shot sizes:", error)
    return NextResponse.json({ success: false, error: "Failed to save shot sizes" }, { status: 500 })
  }
}
