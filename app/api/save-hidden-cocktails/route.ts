import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { hiddenCocktails } = await request.json()
    console.log("[v0] Manuelles Speichern der versteckten Cocktails in Datei:", hiddenCocktails?.length || 0)

    try {
      const fs = require("fs")
      const path = require("path")
      const filePath = "/home/pi/cocktailbot/cocktailbot-main/data/hidden-cocktails-data.json"
      const dirPath = path.dirname(filePath)

      // Stelle sicher, dass das Verzeichnis existiert
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
        console.log("[v0] Verzeichnis erstellt:", dirPath)
      }

      const dataToSave = {
        hiddenCocktails: hiddenCocktails || [],
        lastUpdated: new Date().toISOString(),
      }

      fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2))
      console.log("[v0] Versteckte Cocktails erfolgreich in Datei gespeichert:", filePath)

      return NextResponse.json({
        success: true,
        message: `${hiddenCocktails?.length || 0} versteckte Cocktails in Datei gespeichert`,
      })
    } catch (fsError) {
      console.error("[v0] Dateisystem nicht verfügbar:", fsError)

      // Fallback: Speichere in localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("hidden-cocktails", JSON.stringify(hiddenCocktails || []))
          console.log("[v0] Versteckte Cocktails in localStorage gespeichert")
        } catch (storageError) {
          console.error("[v0] Fehler beim Speichern in localStorage:", storageError)
        }
      }

      return NextResponse.json({
        success: true,
        message: "In localStorage gespeichert (Dateisystem nicht verfügbar)",
        fallback: true,
      })
    }
  } catch (error) {
    console.error("[v0] Fehler beim manuellen Speichern der versteckten Cocktails:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Fehler beim Speichern der versteckten Cocktails",
      },
      { status: 500 },
    )
  }
}
