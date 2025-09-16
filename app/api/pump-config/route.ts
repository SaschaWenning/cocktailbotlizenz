import { type NextRequest, NextResponse } from "next/server"
import { getPumpConfig, savePumpConfig } from "@/lib/cocktail-machine-server"

export async function GET() {
  try {
    console.log("[v0] GET /api/pump-config - Loading pump configuration")
    const pumpConfig = await getPumpConfig()
    console.log("[v0] Returning pump config with", pumpConfig.length, "pumps")
    return NextResponse.json({ success: true, pumpConfig })
  } catch (error) {
    console.error("[v0] Error getting pump config:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to get pump config: ${error.message}`,
        pumpConfig: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] POST /api/pump-config - Saving pump configuration")
    const { pumpConfig } = await request.json()

    if (!pumpConfig || !Array.isArray(pumpConfig)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid pump config data",
        },
        { status: 400 },
      )
    }

    await savePumpConfig(pumpConfig)
    console.log("[v0] Pump config saved successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving pump config:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to save pump config: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
