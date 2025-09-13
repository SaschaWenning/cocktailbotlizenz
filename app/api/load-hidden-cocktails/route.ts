import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    console.log("[v0] Manuelles Laden der versteckten Cocktails aus Datei")

    let hiddenCocktails: string[] = []

    try {
      const fs = require("fs")
      const path = require("path")
      const filePath = "/home/pi/cocktailbot/cocktailbot-main/data/hidden-cocktails-data.json"

      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf8")
        const data = JSON.parse(fileContent)
        hiddenCocktails = data.hiddenCocktails || []
        console.log("[v0] Versteckte Cocktails aus Datei geladen:", hiddenCocktails.length)
      } else {
        console.log("[v0] Keine Datei für versteckte Cocktails gefunden, verwende leere Liste")
      }
    } catch (fsError) {
      console.error("[v0] Dateisystem nicht verfügbar:", fsError)

      // Fallback: Versuche aus localStorage zu laden
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("hidden-cocktails")
          hiddenCocktails = stored ? JSON.parse(stored) : []
          console.log("[v0] Versteckte Cocktails aus localStorage geladen:", hiddenCocktails.length)
        } catch (storageError) {
          console.error("[v0] Fehler beim Laden aus localStorage:", storageError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      hiddenCocktails,
      message: `${hiddenCocktails.length} versteckte Cocktails geladen`,
    })
  } catch (error) {
    console.error("[v0] Fehler beim manuellen Laden der versteckten Cocktails:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Fehler beim Laden der versteckten Cocktails",
        hiddenCocktails: [],
      },
      { status: 500 },
    )
  }
}
