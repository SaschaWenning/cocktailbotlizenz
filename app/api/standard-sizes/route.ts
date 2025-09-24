import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const DEFAULT_STANDARD_SIZES = [200, 300, 400]
const STANDARD_SIZES_PATH = path.join(process.cwd(), "data", "standard-sizes.json")

function loadStandardSizes(): number[] {
  try {
    if (fs.existsSync(STANDARD_SIZES_PATH)) {
      const data = fs.readFileSync(STANDARD_SIZES_PATH, "utf8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error loading standard sizes:", error)
  }
  return DEFAULT_STANDARD_SIZES
}

function saveStandardSizes(sizes: number[]): void {
  try {
    fs.mkdirSync(path.dirname(STANDARD_SIZES_PATH), { recursive: true })
    fs.writeFileSync(STANDARD_SIZES_PATH, JSON.stringify(sizes, null, 2), "utf8")
    console.log(`[v0] Standard sizes saved: ${sizes}`)
  } catch (error) {
    console.error("Error saving standard sizes:", error)
    throw error
  }
}

export async function GET() {
  try {
    const standardSizes = loadStandardSizes()
    return NextResponse.json({ standardSizes })
  } catch (error) {
    console.error("Error loading standard sizes:", error)
    return NextResponse.json({ standardSizes: DEFAULT_STANDARD_SIZES })
  }
}

export async function POST(request: Request) {
  try {
    const { standardSizes } = await request.json()

    saveStandardSizes(standardSizes)

    return NextResponse.json({ success: true, standardSizes })
  } catch (error) {
    console.error("Error saving standard sizes:", error)
    return NextResponse.json({ success: false, error: "Failed to save standard sizes" }, { status: 500 })
  }
}
