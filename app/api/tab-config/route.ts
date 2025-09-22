import { type NextRequest, NextResponse } from "next/server"
import { type AppConfig, defaultTabConfig } from "@/lib/tab-config"

export const dynamic = "force-dynamic"

let storedConfig: AppConfig = defaultTabConfig

function validateAndUpdateConfig(config: AppConfig): AppConfig {
  const requiredTabIds = defaultTabConfig.tabs.map((tab) => tab.id)
  const configTabIds = config.tabs.map((tab) => tab.id)

  // Prüfe, ob alle erforderlichen Tabs vorhanden sind
  const missingTabs = requiredTabIds.filter((id) => !configTabIds.includes(id))

  if (missingTabs.length > 0) {
    console.log("[v0] Missing tabs detected, updating configuration:", missingTabs)

    // Füge fehlende Tabs aus der Standard-Konfiguration hinzu
    const updatedTabs = [...config.tabs]
    missingTabs.forEach((tabId) => {
      const defaultTab = defaultTabConfig.tabs.find((tab) => tab.id === tabId)
      if (defaultTab) {
        updatedTabs.push(defaultTab)
      }
    })

    const updatedConfig = { ...config, tabs: updatedTabs }
    storedConfig = updatedConfig
    return updatedConfig
  }

  return config
}

function getStoredConfig(): AppConfig {
  try {
    console.log("[v0] Tab config loaded from memory:", storedConfig)
    return validateAndUpdateConfig(storedConfig)
  } catch (error) {
    console.error("[v0] Error in getStoredConfig:", error)
    return defaultTabConfig
  }
}

function saveStoredConfig(config: AppConfig): void {
  try {
    storedConfig = config
    console.log("[v0] Tab config saved to memory")
  } catch (error) {
    console.error("[v0] Error saving tab config:", error)
    throw error
  }
}

export async function GET() {
  try {
    const config = getStoredConfig()
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

    saveStoredConfig(config)
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

    const currentConfig = getStoredConfig()
    const tab = currentConfig.tabs.find((t) => t.id === tabId)
    if (!tab) {
      return NextResponse.json({ error: `Tab with id ${tabId} not found` }, { status: 404 })
    }

    if (tab.alwaysVisible && newLocation !== tab.location) {
      return NextResponse.json({ error: `Tab ${tabId} cannot be moved as it must always be visible` }, { status: 400 })
    }

    tab.location = newLocation
    saveStoredConfig(currentConfig)
    console.log("[v0] Tab location updated successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating tab location:", error)
    return NextResponse.json({ error: "Failed to update tab location" }, { status: 500 })
  }
}
