import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("[v0] 🔄 Starting manual load from file...")

    // Versuche Node.js fs zu verwenden
    let fs: any
    try {
      fs = require("fs")
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

      return NextResponse.json({
        success: true,
        message: "Daten erfolgreich aus Datei geladen",
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
