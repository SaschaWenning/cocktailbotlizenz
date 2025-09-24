import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// In-memory storage for hidden cocktails
let hiddenCocktails: string[] = []

export async function GET() {
  return NextResponse.json({ success: true, hiddenCocktails })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const list = Array.isArray(body) ? body : (body?.hiddenCocktails ?? [])
    if (!Array.isArray(list)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 })
    }
    hiddenCocktails = list
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to save hidden cocktails" }, { status: 500 })
  }
}
