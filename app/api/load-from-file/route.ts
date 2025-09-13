import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("[v0] 🔄 Manuelles Laden gestartet...")

    return NextResponse.json({
      success: true,
      message: "Daten erfolgreich geladen",
      action: "reload_data",
    })
  } catch (error) {
    console.error("[v0] ❌ Fehler beim manuellen Laden:", error)
    return NextResponse.json({
      success: false,
      message: "Fehler beim manuellen Laden!",
    })
  }
}
