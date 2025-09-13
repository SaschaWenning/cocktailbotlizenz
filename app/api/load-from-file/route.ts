import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("[v0] 🔄 Starting manual load from localStorage...")

    // Da das System bereits localStorage verwendet, laden wir die Daten von dort
    const storageKey = "cocktailbot_ingredient_levels"

    // In der Server-Umgebung können wir nicht direkt auf localStorage zugreifen
    // Aber wir können die Client-Seite anweisen, die Daten zu laden
    return NextResponse.json({
      success: true,
      message: "Lade gespeicherte Daten aus localStorage",
      action: "load_from_storage",
      storageKey: storageKey,
    })
  } catch (error) {
    console.error("[v0] ❌ Error in manual load:", error)
    return NextResponse.json({
      success: false,
      message: `Unerwarteter Fehler: ${error}`,
      data: null,
    })
  }
}
