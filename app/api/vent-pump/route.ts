import { type NextRequest, NextResponse } from "next/server"
import { ventPumpAction } from "@/lib/cocktail-machine-server"

export async function POST(request: NextRequest) {
  try {
    const { pumpId, durationMs } = await request.json()
    const result = await ventPumpAction(pumpId, durationMs)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error venting pump:", error)
    return NextResponse.json({ success: false, error: "Failed to vent pump" }, { status: 500 })
  }
}
