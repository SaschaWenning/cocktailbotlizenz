import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"

const execAsync = promisify(exec)

const LED_PYTHON_SCRIPT = path.join(process.cwd(), "scripts/led_controller.py")

export async function GET(request: Request) {
  try {
    return NextResponse.json({ success: true, message: "LED Control API ist aktiv" })
  } catch (error) {
    console.error("Fehler in der LED Control API-Route (GET):", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unbekannter Fehler" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    if (!fs.existsSync(LED_PYTHON_SCRIPT)) {
      console.error(`LED Python-Skript nicht gefunden: ${LED_PYTHON_SCRIPT}`)
      return NextResponse.json(
        { success: false, error: `LED Python-Skript nicht gefunden: ${LED_PYTHON_SCRIPT}` },
        { status: 500 },
      )
    }

    let data
    try {
      data = await request.json()
    } catch (error) {
      console.error("Fehler beim Parsen des Request-Body:", error)
      return NextResponse.json({ success: false, error: "Ungültiger Request-Body" }, { status: 400 })
    }

    const { action, command, data: ledData } = data

    if (!action) {
      return NextResponse.json({ success: false, error: "Aktion ist erforderlich" }, { status: 400 })
    }

    let result
    let cmdOutput = ""

    try {
      switch (action) {
        case "led_command":
          if (!command) {
            return NextResponse.json({ success: false, error: "LED-Befehl ist erforderlich" }, { status: 400 })
          }

          console.log(`Führe LED-Befehl aus: ${command}`)
          const ledCmd = `python3 ${LED_PYTHON_SCRIPT} ${command} '${JSON.stringify(ledData)}'`
          console.log(`Befehl: ${ledCmd}`)
          const ledResult = await execAsync(ledCmd)
          cmdOutput = ledResult.stdout.trim()
          console.log(`LED-Ausgabe: ${cmdOutput}`)
          break

        case "test":
          console.log("Führe LED-Test aus...")
          return NextResponse.json({ success: true, message: "LED-Test erfolgreich" })

        default:
          return NextResponse.json({ success: false, error: `Ungültige Aktion: ${action}` }, { status: 400 })
      }

      try {
        result = JSON.parse(cmdOutput)
      } catch (error) {
        console.error(`Fehler beim Parsen der LED Python-Ausgabe: ${cmdOutput}`, error)
        return NextResponse.json(
          {
            success: false,
            error: "Ungültige Ausgabe vom LED Python-Skript",
            output: cmdOutput,
          },
          { status: 500 },
        )
      }

      return NextResponse.json(result)
    } catch (error) {
      console.error(`Fehler bei der Ausführung der LED-Aktion ${action}:`, error)
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unbekannter Fehler",
          command: action,
          output: cmdOutput,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Allgemeiner Fehler in der LED Control API-Route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unbekannter Fehler" },
      { status: 500 },
    )
  }
}
