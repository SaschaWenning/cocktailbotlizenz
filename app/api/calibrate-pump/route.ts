import { type NextRequest, NextResponse } from "next/server"
import { calibratePump } from "@/lib/cocktail-machine"

export async function POST(request: NextRequest) {
  try {
    const { pumpId, duration } = await request.json()
    const result = await calibratePump(pumpId, duration)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error calibrating pump:", error)
    return NextResponse.json({ error: "Failed to calibrate pump" }, { status: 500 })
  }
}
