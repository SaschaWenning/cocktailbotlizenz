import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    console.log("[v0] Manuelles Laden der versteckten Cocktails aus Datei")

    let hiddenCocktails: string[] = []

    try {
      // Versuche aus localStorage zu laden (funktioniert nur client-seitig)
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("hidden-cocktails")
        hiddenCocktails = stored ? JSON.parse(stored) : []
        console.log("[v0] Versteckte Cocktails aus localStorage geladen:", hiddenCocktails.length)
      } else {
        console.log("[v0] Server-seitig - keine localStorage verfügbar")
      }
    } catch (error) {
      console.error("[v0] Fehler beim Laden aus localStorage:", error)
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
