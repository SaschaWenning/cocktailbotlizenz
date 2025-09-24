import { type NextRequest, NextResponse } from "next/server"
import { loadCustomPassword, saveCustomPassword } from "@/lib/persistent-storage"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const customPassword = await loadCustomPassword()
    return NextResponse.json({ success: true, customPassword })
  } catch (error) {
    console.error("Error loading custom password:", error)
    return NextResponse.json({ success: true, customPassword: "" })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customPassword } = await request.json()
    await saveCustomPassword(customPassword || "")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving custom password:", error)
    return NextResponse.json({ success: false, error: "Failed to save custom password" }, { status: 500 })
  }
}
