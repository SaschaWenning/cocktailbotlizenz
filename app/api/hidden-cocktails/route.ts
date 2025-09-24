import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ success: true, hiddenCocktails: [] })
}

export async function POST() {
  return NextResponse.json({ success: true })
}
