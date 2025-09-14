import { NextResponse } from "next/server"
import fs from "fs"

export async function POST() {
  try {
    console.log("[v0] 🔄 Starting manual load from file...")

    try {
      console.log("[v0] ✅ Node.js fs module loaded successfully")
    } catch (error) {
      console.log("[v0] ❌ Node.js fs not available:", error)
      return NextResponse.json({
        success: false,
        message: "Dateisystem nicht verfügbar (nur in v0 Vorschau)",
        data: null,
      })
    }

    const filePath = "/home/pi/cocktailbot/cocktailbot-main/data/ingredient-levels-data.json"

    try {
      // Prüfe ob Datei existiert
      if (!fs.existsSync(filePath)) {
        console.log("[v0] ❌ File does not exist:", filePath)
        return NextResponse.json({
          success: false,
          message: "Keine gespeicherte Datei gefunden",
          data: null,
        })
      }

      // Lade Datei
      const fileContent = fs.readFileSync(filePath, "utf8")
      const data = JSON.parse(fileContent)

      console.log("[v0] ✅ Successfully loaded data from file:", Object.keys(data).length, "ingredients")

      // Normalisieren in dein IngredientLevel-Schema:
      type Raw = { name?: string; currentAmount?: number; capacity?: number; lastRefill?: string | number | Date }
      const levels = Object.entries(data).map(([key, raw]: [string, Raw]) => {
        // Falls key schon numerisch ist, ersetze die nächste Zeile durch: const pumpId = Number(key)
        const pumpId = Number(String(key).replace(/[^\d]/g, ""))
        return {
          pumpId,
          ingredient: raw?.name ?? `Zutat ${pumpId}`,
          containerSize: Number(raw?.capacity ?? 1000),
          currentLevel: Number(raw?.currentAmount ?? 0),
          lastUpdated: raw?.lastRefill ? new Date(raw.lastRefill) : new Date(),
        }
      })

      return NextResponse.json({ levels })
    } catch (error) {
      console.log("[v0] ❌ Error reading file:", error)
      return NextResponse.json({
        success: false,
        message: `Fehler beim Lesen der Datei: ${error}`,
        data: null,
      })
    }
  } catch (error) {
    console.error("[v0] ❌ Error in manual load:", error)
    return NextResponse.json({
      success: false,
      message: `Unerwarteter Fehler: ${error}`,
      data: null,
    })
  }
}
