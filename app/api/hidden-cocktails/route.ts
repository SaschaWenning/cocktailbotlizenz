import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

const DATA_DIR = path.join(process.cwd(), "data")
const FILE = path.join(DATA_DIR, "hidden-cocktails.json")

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export async function GET() {
  try {
    ensureDir()
    if (!fs.existsSync(FILE)) {
      return NextResponse.json({ success: true, hidden: [] })
    }
    const raw = fs.readFileSync(FILE, "utf8")
    const hidden = JSON.parse(raw)
    return NextResponse.json({ success: true, hidden })
  } catch (e) {
    console.error("GET /api/hidden-cocktails failed:", e)
    return NextResponse.json({ success: false, error: "Failed to read hidden list" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const hidden = Array.isArray(body) ? body : body.hidden
    if (!Array.isArray(hidden)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 })
    }
    ensureDir()
    fs.writeFileSync(FILE, JSON.stringify(hidden, null, 2), "utf8")
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("POST /api/hidden-cocktails failed:", e)
    return NextResponse.json({ success: false, error: "Failed to save hidden list" }, { status: 500 })
  }
}
