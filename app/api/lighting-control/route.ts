import { type NextRequest, NextResponse } from "next/server"
let execFile: any
let promisify: any
let path: any

async function initNodeModules() {
  if (typeof window === "undefined") {
    try {
      const childProcess = await import("child_process")
      const utilModule = await import("util")
      const pathModule = await import("path")
      execFile = childProcess.execFile
      promisify = utilModule.promisify
      path = pathModule.default
      return true
    } catch (error) {
      console.log("[v0] Node modules not available (preview mode)")
      return false
    }
  }
  return false
}

function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === "development" || !process.env.LED_HARDWARE_ENABLED
}

async function runLed(...args: string[]): Promise<void> {
  if (isDevelopmentMode()) {
    console.log("[v0] LED command (simulated):", args)
    await new Promise((resolve) => setTimeout(resolve, 300))
    return
  }

  const hasNodeModules = await initNodeModules()
  if (!hasNodeModules || !execFile || !promisify || !path) {
    console.log("[v0] LED command skipped (no Node modules):", args)
    return
  }

  const execFileAsync = promisify(execFile)
  const scriptPath = path.join(process.cwd(), "scripts", "led_client.py")
  console.log("[v0] LED command:", { scriptPath, args })

  try {
    const result = await execFileAsync("python3", [scriptPath, ...args])
    console.log("[v0] LED command success:", result)
  } catch (error) {
    console.error("[v0] LED command failed:", error)
    throw error
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

export async function POST(request: NextRequest) {
  try {
    const { mode, color, brightness, blinking, scheme } = await request.json()

    console.log("[v0] Lighting control POST request:", { mode, color, brightness, blinking, scheme })

    await sendLightingControlCommand(mode, color, brightness, blinking, scheme)

    console.log("[v0] Lighting control command sent successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error controlling lighting:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Failed to control lighting",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    console.log("[v0] Lighting control GET request - testing with rainbow")
    await runLed("RAINBOW", "30")
    return NextResponse.json({ success: true, message: "Rainbow test started" })
  } catch (error) {
    console.error("[v0] Error testing lighting:", error)
    return NextResponse.json({ error: "Failed to test lighting" }, { status: 500 })
  }
}

async function sendLightingControlCommand(
  mode: string,
  color?: string,
  brightness?: number,
  blinking?: boolean,
  scheme?: string,
) {
  try {
    if (typeof brightness === "number" && brightness >= 0 && brightness <= 255) {
      await runLed("BRIGHT", String(brightness))
    }

    switch (mode) {
      case "cocktailPreparation":
      case "preparation":
        await runLed("BUSY")
        console.log("[v0] LED Modus: Zubereitung (BUSY)")
        break

      case "cocktailFinished":
      case "finished":
        await runLed("READY")
        console.log("[v0] LED Modus: Fertig (READY)")
        break

      case "idle":
        if (scheme === "pulse") {
          if (color) {
            const rgb = hexToRgb(color)
            if (rgb) {
              await runLed("PULSE", String(rgb.r), String(rgb.g), String(rgb.b))
              console.log(`[v0] LED Modus: Pulsieren RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`)
            }
          } else {
            await runLed("PULSE", "255", "255", "255")
            console.log("[v0] LED Modus: Pulsieren (weiß)")
          }
        } else if (scheme === "blink") {
          if (color) {
            const rgb = hexToRgb(color)
            if (rgb) {
              await runLed("BLINK", String(rgb.r), String(rgb.g), String(rgb.b))
              console.log(`[v0] LED Modus: Blitz RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`)
            }
          } else {
            await runLed("BLINK", "255", "255", "255")
            console.log("[v0] LED Modus: Blitz (weiß)")
          }
        } else if (scheme === "rainbow") {
          await runLed("RAINBOW", "30")
          console.log("[v0] LED Modus: Regenbogen")
        } else {
          await runLed("IDLE")
          console.log("[v0] LED Modus: Idle (default)")
        }
        break

      case "off":
        await runLed("OFF")
        console.log("[v0] LED Modus: Aus")
        break

      case "color":
        if (color) {
          const rgb = hexToRgb(color)
          if (rgb) {
            await runLed("COLOR", String(rgb.r), String(rgb.g), String(rgb.b))
            console.log(`[v0] LED Farbe gesetzt: RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`)
          }
        }
        break

      default:
        console.warn("[v0] Unbekannter LED-Modus:", mode)
    }

    return true
  } catch (error) {
    console.error("[v0] Error sending lighting control command:", error)
    throw error
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
