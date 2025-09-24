import { NextResponse } from "next/server"

const DEFAULT_STANDARD_SIZES = [200, 300, 400]

export async function GET() {
  try {
    return NextResponse.json({ standardSizes: DEFAULT_STANDARD_SIZES })
  } catch (error) {
    console.error("Error loading standard sizes:", error)
    return NextResponse.json({ standardSizes: DEFAULT_STANDARD_SIZES })
  }
}

export async function POST(request: Request) {
  try {
    const { standardSizes } = await request.json()

    console.log(`[v0] Standard sizes received: ${standardSizes}`)

    return NextResponse.json({ success: true, standardSizes })
  } catch (error) {
    console.error("Error saving standard sizes:", error)
    return NextResponse.json({ success: false, error: "Failed to save standard sizes" }, { status: 500 })
  }
}
