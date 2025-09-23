import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

let settingsCache: any = { language: "de" }

// Simuliert Dateisystem-Persistierung für Raspberry Pi
async function readSettings(): Promise<any> {
  try {
    // In einer echten Implementierung würde hier eine Datei gelesen werden
    // Für jetzt verwenden wir den Cache
    return settingsCache
  } catch {
    return { language: "de" }
  }
}

async function writeSettings(obj: any): Promise<void> {
  try {
    // In einer echten Implementierung würde hier eine Datei geschrieben werden
    // Für jetzt aktualisieren wir den Cache
    settingsCache = { ...settingsCache, ...obj }
  } catch {
    // Fehler beim Schreiben ignorieren
  }
}

export async function GET() {
  const settings = await readSettings()
  return NextResponse.json({ success: true, ...settings })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const lang = body?.language

    if (lang !== "de" && lang !== "en") {
      return NextResponse.json({ success: false, error: "Invalid language" }, { status: 400 })
    }

    const currentSettings = await readSettings()
    const newSettings = { ...currentSettings, language: lang }
    await writeSettings(newSettings)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message ?? "write failed" }, { status: 500 })
  }
}
