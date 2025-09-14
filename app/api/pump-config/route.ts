import { type NextRequest, NextResponse } from "next/server"
import { getPumpConfig, savePumpConfig } from "@/lib/cocktail-machine"
import type { PumpConfig } from "@/types/pump"

export async function GET() {
  try {
    const config = await getPumpConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error("Error loading pump config:", error)
    return NextResponse.json({ error: "Failed to load pump config" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const pumpConfig: PumpConfig[] = await request.json()
    await savePumpConfig(pumpConfig)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving pump config:", error)
    return NextResponse.json({ error: "Failed to save pump config" }, { status: 500 })
  }
}
