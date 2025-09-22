import { NextResponse } from "next/server"
import { cocktails } from "@/data/cocktails"

export async function GET() {
  try {
    return NextResponse.json({ success: true, cocktails })
  } catch (error) {
    console.error("Error getting cocktails:", error)
    return NextResponse.json({ success: false, error: "Failed to get cocktails" }, { status: 500 })
  }
}
