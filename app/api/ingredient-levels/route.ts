import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const levels = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("ingredient-levels") || "[]") : []

    console.log("[v0] Ingredient levels GET request, returning:", levels.length, "levels")
    return NextResponse.json(levels)
  } catch (error) {
    console.error("[v0] Error loading ingredient levels:", error)
    return NextResponse.json([], { status: 200 }) // Return empty array as fallback
  }
}

export async function POST(request: Request) {
  try {
    const levels = await request.json()

    if (typeof window !== "undefined") {
      localStorage.setItem("ingredient-levels", JSON.stringify(levels))
    }

    console.log("[v0] Saved ingredient levels:", levels.length, "levels")
    return NextResponse.json({ success: true, count: levels.length })
  } catch (error) {
    console.error("[v0] Error saving ingredient levels:", error)
    return NextResponse.json({ success: false, error: "Failed to save levels" }, { status: 500 })
  }
}
