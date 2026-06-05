import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import type { VentingConfig } from "@/types/pump"

const CONFIG_PATH = path.join(process.cwd(), "data", "venting-config.json")

// GET: Hole aktuelle Entlüftungs-Zeiten
export async function GET() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, "utf-8")
    const config: VentingConfig = JSON.parse(data)
    return NextResponse.json(config)
  } catch (error) {
    console.error("Error reading venting config:", error)
    return NextResponse.json(
      { error: "Failed to read venting config" },
      { status: 500 }
    )
  }
}

// POST: Speichere Entlüftungs-Zeiten
export async function POST(request: NextRequest) {
  try {
    const config: VentingConfig = await request.json()

    // Validiere die Konfiguration
    for (const [pumpId, duration] of Object.entries(config)) {
      if (typeof duration !== "number" || duration < 100 || duration > 10000) {
        return NextResponse.json(
          { error: `Invalid duration for pump ${pumpId}. Must be between 100-10000ms` },
          { status: 400 }
        )
      }
    }

    // Schreibe die neue Konfiguration
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8")

    return NextResponse.json({
      success: true,
      message: "Venting configuration saved successfully",
    })
  } catch (error) {
    console.error("Error saving venting config:", error)
    return NextResponse.json(
      { error: "Failed to save venting config" },
      { status: 500 }
    )
  }
}
