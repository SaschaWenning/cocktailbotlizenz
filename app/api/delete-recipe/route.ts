import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const COCKTAILS_PATH = path.join(process.cwd(), "data", "custom-cocktails.json")
const DELETED_COCKTAILS_PATH = path.join(process.cwd(), "data", "deleted-cocktails.json")

export async function POST(request: NextRequest) {
  try {
    const { cocktailId } = await request.json()

    if (!cocktailId) {
      return NextResponse.json({ success: false, error: "Cocktail ID is required" }, { status: 400 })
    }

    console.log(`Lösche Cocktail: ${cocktailId}`)

    // Stelle sicher, dass das Verzeichnis existiert
    fs.mkdirSync(path.dirname(COCKTAILS_PATH), { recursive: true })
    fs.mkdirSync(path.dirname(DELETED_COCKTAILS_PATH), { recursive: true })

    // Lade bestehende benutzerdefinierte Cocktails
    let customCocktails: any[] = []
    if (fs.existsSync(COCKTAILS_PATH)) {
      const data = fs.readFileSync(COCKTAILS_PATH, "utf8")
      customCocktails = JSON.parse(data)
    }

    // Lade gelöschte Cocktails Liste
    let deletedCocktails: string[] = []
    if (fs.existsSync(DELETED_COCKTAILS_PATH)) {
      const data = fs.readFileSync(DELETED_COCKTAILS_PATH, "utf8")
      deletedCocktails = JSON.parse(data)
    }

    // Entferne den Cocktail aus benutzerdefinierten Cocktails (falls vorhanden)
    customCocktails = customCocktails.filter((c) => c.id !== cocktailId)

    // Füge zur gelöschten Liste hinzu (um Standard-Cocktails zu verstecken)
    if (!deletedCocktails.includes(cocktailId)) {
      deletedCocktails.push(cocktailId)
    }

    // Speichere beide Dateien
    fs.writeFileSync(COCKTAILS_PATH, JSON.stringify(customCocktails, null, 2), "utf8")
    fs.writeFileSync(DELETED_COCKTAILS_PATH, JSON.stringify(deletedCocktails, null, 2), "utf8")

    console.log(`Cocktail ${cocktailId} erfolgreich gelöscht`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Fehler beim Löschen des Cocktails:", error)
    return NextResponse.json({ success: false, error: "Failed to delete cocktail" }, { status: 500 })
  }
}
