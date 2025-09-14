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

      const { setIngredientLevels, resetCache } = await import("@/lib/ingredient-level-service")

      // Konvertiere die Daten in das richtige Format
      const levels = Object.entries(data).map(([ingredientId, levelData]: [string, any]) => ({
        ingredientId,
        currentAmount: levelData.currentAmount || 0,
        capacity: levelData.capacity || 1000,
        lastRefill: new Date(levelData.lastRefill || new Date()),
      }))

      // Setze die Füllstände direkt im Service
      await setIngredientLevels(levels)

      return NextResponse.json({
        success: true,
        message: "Daten erfolgreich aus Datei geladen und Cache aktualisiert",
        data: data,
        path: filePath,
      })
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
