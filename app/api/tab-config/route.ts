import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { type AppConfig, defaultTabConfig } from "@/lib/tab-config"

export const dynamic = "force-dynamic"

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
    const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "tab-config.json")

    try {
      const dataDir = path.dirname(CONFIG_FILE_PATH)
      await fs.promises.mkdir(dataDir, { recursive: true })
      const data = await fs.promises.readFile(CONFIG_FILE_PATH, "utf-8")
      const parsedConfig = JSON.parse(data)
      console.log("[v0] Tab config loaded from file:", parsedConfig)
      return validateAndUpdateConfig(parsedConfig)
    } catch (fileError) {
      console.log("[v0] No existing tab config file found, using default config")
      // Speichere die Standard-Konfiguration
      await saveStoredConfig(defaultTabConfig)
      return defaultTabConfig
    }
  } catch (error) {
    console.error("[v0] Error in getStoredConfig:", error)
    return defaultTabConfig
  }
}

async function saveStoredConfig(config: AppConfig): Promise<void> {
  try {
    const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "tab-config.json")
    const dataDir = path.dirname(CONFIG_FILE_PATH)
    await fs.promises.mkdir(dataDir, { recursive: true })
    await fs.promises.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2))
    console.log("[v0] Tab config saved to file:", CONFIG_FILE_PATH)
  } catch (error) {
    console.error("[v0] Error saving tab config:", error)
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
    return NextResponse.json(defaultTabConfig, { status: 200 })
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
    return NextResponse.json({ error: "Failed to save tab config" }, { status: 500 })
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
