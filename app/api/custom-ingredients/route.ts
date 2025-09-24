import { type NextRequest, NextResponse } from "next/server"
import { loadCustomIngredients, saveCustomIngredients } from "@/lib/persistent-storage"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const customIngredients = await loadCustomIngredients()
    return NextResponse.json({ success: true, customIngredients })
  } catch (error) {
    console.error("Error loading custom ingredients:", error)
    return NextResponse.json({ success: true, customIngredients: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customIngredients } = await request.json()
    await saveCustomIngredients(customIngredients || [])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving custom ingredients:", error)
    return NextResponse.json({ success: false, error: "Failed to save custom ingredients" }, { status: 500 })
  }
}
