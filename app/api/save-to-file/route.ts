import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log("[v0] Manual save request received:", Object.keys(data).length, "items")

    // Versuche direkt in Datei zu schreiben (nur auf Raspberry Pi)
    try {
      // Dynamischer Import für bessere Kompatibilität
      const fs = await import("fs/promises")
      const path = await import("path")

      const dataDir = "/home/pi/cocktailbot/cocktailbot-main/data"
      const filePath = path.join(dataDir, "ingredient-levels-data.json")

      // Erstelle Verzeichnis falls es nicht existiert
      await fs.mkdir(dataDir, { recursive: true })

      // Schreibe Daten in Datei
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8")

      console.log("[v0] ✅ Daten erfolgreich in Datei gespeichert:", filePath)

      return NextResponse.json({
        success: true,
        message: "Daten erfolgreich in Datei gespeichert",
        path: filePath,
      })
    } catch (fileError) {
      console.log("[v0] ❌ Dateispeicherung fehlgeschlagen:", fileError)

      return NextResponse.json(
        {
          success: false,
          message: "Dateispeicherung nicht möglich - läuft nicht auf Raspberry Pi",
          error: fileError instanceof Error ? fileError.message : "Unknown error",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("[v0] Error in manual save:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Fehler beim manuellen Speichern",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
