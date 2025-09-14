import { type NextRequest, NextResponse } from "next/server"
import { cleanPump } from "@/lib/cocktail-machine"

export async function POST(request: NextRequest) {
  try {
    const { pumpId, duration } = await request.json()
    const result = await cleanPump(pumpId, duration)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error cleaning pump:", error)
    return NextResponse.json({ error: "Failed to clean pump" }, { status: 500 })
  }
}
