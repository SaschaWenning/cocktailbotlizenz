import { type NextRequest, NextResponse } from "next/server"
import { type AppConfig, defaultTabConfig } from "@/lib/tab-config"
import { promises as fs } from "fs"
import path from "path"

export const dynamic = "force-dynamic"

const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "tab-config.json")

function validateAndUpdateConfig(storedConfig: AppConfig): AppConfig {
  const requiredTabIds = defaultTabConfig.tabs.map((tab) => tab.id)
  const storedTabIds = storedConfig.tabs.map((tab) => tab.id)

  // Prüfe, ob alle erforderlichen Tabs vorhanden sind
  const missingTabs = requiredTabIds.filter((id) => !storedTabIds.includes(id))

  if (missingTabs.length > 0) {
    console.log("[v0] Missing tabs detected, updating configuration:", missingTabs)

    // Füge fehlende Tabs aus der Standard-Konfiguration hinzu
    const updatedTabs = [...storedConfig.tabs]
    missingTabs.forEach((tabId) => {
      const defaultTab = defaultTabConfig.tabs.find((tab) => tab.id === tabId)
      if (defaultTab) {
        updatedTabs.push(defaultTab)
      }
    })

    const updatedConfig = { ...storedConfig, tabs: updatedTabs }
    saveStoredConfig(updatedConfig)
    return updatedConfig
  }

  return storedConfig
}

async function getStoredConfig(): Promise<AppConfig> {
  try {
    // Stelle sicher, dass das data-Verzeichnis existiert
    const dataDir = path.dirname(CONFIG_FILE_PATH)
    await fs.mkdir(dataDir, { recursive: true })

    const data = await fs.readFile(CONFIG_FILE_PATH, "utf-8")
    const parsedConfig = JSON.parse(data)
    console.log("[v0] Tab config loaded from file:", parsedConfig)
    return validateAndUpdateConfig(parsedConfig)
  } catch (error) {
    console.log("[v0] No existing tab config file found, using default config")
    // Speichere die Standard-Konfiguration
    await saveStoredConfig(defaultTabConfig)
    return defaultTabConfig
  }
}

async function saveStoredConfig(config: AppConfig): Promise<void> {
  try {
    // Stelle sicher, dass das data-Verzeichnis existiert
    const dataDir = path.dirname(CONFIG_FILE_PATH)
    await fs.mkdir(dataDir, { recursive: true })

    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2))
    console.log("[v0] Tab config saved to file:", CONFIG_FILE_PATH)
  } catch (error) {
    console.error("[v0] Error saving tab config to file:", error)
    throw error
  }
}

export async function GET() {
  try {
    const config = await getStoredConfig()
    console.log("[v0] Returning tab config:", config)
    return NextResponse.json(config)
  } catch (error) {
    console.error("[v0] Error in tab config GET:", error)
    return NextResponse.json(defaultTabConfig)
  }
}

export async function POST(request: NextRequest) {
  try {
    const config: AppConfig = await request.json()
    console.log("[v0] Updating tab config:", config)

    await saveStoredConfig(config)
    console.log("[v0] Tab config updated successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving tab config:", error)
    return NextResponse.json({ error: "Failed to save tab configuration" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { tabId, newLocation } = await request.json()
    console.log("[v0] Updating tab location:", tabId, "to", newLocation)

    const currentConfig = await getStoredConfig()
    const tab = currentConfig.tabs.find((t) => t.id === tabId)
    if (!tab) {
      return NextResponse.json({ error: `Tab with id ${tabId} not found` }, { status: 404 })
    }

    if (tab.alwaysVisible && newLocation !== tab.location) {
      return NextResponse.json({ error: `Tab ${tabId} cannot be moved as it must always be visible` }, { status: 400 })
    }

    tab.location = newLocation
    await saveStoredConfig(currentConfig)
    console.log("[v0] Tab location updated successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating tab location:", error)
    return NextResponse.json({ error: "Failed to update tab location" }, { status: 500 })
  }
}
