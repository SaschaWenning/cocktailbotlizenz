import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imagePath = searchParams.get("path")

    if (!imagePath) {
      return NextResponse.json({ error: "Bildpfad ist erforderlich" }, { status: 400 })
    }

    // Einfache Weiterleitung zu statischen Bildern
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`

    return NextResponse.redirect(new URL(cleanPath, request.url))
  } catch (error) {
    console.error("Image API Error:", error)
    return NextResponse.json({ error: "Fehler beim Laden des Bildes" }, { status: 500 })
  }
}
