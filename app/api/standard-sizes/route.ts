import { NextResponse } from "next/server"
import { loadStandardSizes, saveStandardSizes } from "@/lib/persistent-storage"

const DEFAULT_STANDARD_SIZES = [200, 300, 400]

export async function GET() {
  try {
    const standardSizes = await loadStandardSizes()
    return NextResponse.json({ standardSizes })
  } catch (error) {
    console.error("Error loading standard sizes:", error)
    return NextResponse.json({ standardSizes: DEFAULT_STANDARD_SIZES })
  }
}

export async function POST(request: Request) {
  try {
    const { standardSizes } = await request.json()
    await saveStandardSizes(standardSizes)
    return NextResponse.json({ success: true, standardSizes })
  } catch (error) {
    console.error("Error saving standard sizes:", error)
    return NextResponse.json({ success: false, error: "Failed to save standard sizes" }, { status: 500 })
  }
}
