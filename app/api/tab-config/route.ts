import { type NextRequest, NextResponse } from "next/server"
import { type AppConfig, defaultTabConfig } from "@/lib/tab-config"

export const dynamic = "force-dynamic"

let configCache: AppConfig | null = null
let isInitialized = false

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

function getLocalStorageConfig(): AppConfig | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem("tab-config")
      if (stored) {
        const parsedConfig = JSON.parse(stored)
        console.log("[v0] Tab config loaded from localStorage:", parsedConfig)
        return validateAndUpdateConfig(parsedConfig)
      }
    }
  } catch (error) {
    console.log("[v0] Error reading from localStorage:", error)
  }
  return null
}

function saveLocalStorageConfig(config: AppConfig): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("tab-config", JSON.stringify(config))
      console.log("[v0] Tab config saved to localStorage")
    }
  } catch (error) {
    console.error("[v0] Error saving to localStorage:", error)
  }
}

// Initialisierung nur einmal durchführen
function initializeConfig(): AppConfig {
  if (!isInitialized) {
    const localStorageConfig = getLocalStorageConfig()
    if (localStorageConfig) {
      configCache = localStorageConfig
      console.log("[v0] Tab config initialized from localStorage")
    } else {
      configCache = defaultTabConfig
      saveLocalStorageConfig(defaultTabConfig)
      console.log("[v0] Tab config initialized with default values")
    }
    isInitialized = true
  }
  return configCache!
}

async function getStoredConfig(): Promise<AppConfig> {
  // Verwende den Cache wenn bereits initialisiert
  if (configCache) {
    console.log("[v0] Returning cached tab config")
    return configCache
  }

  return initializeConfig()
}

async function saveStoredConfig(config: AppConfig): Promise<void> {
  try {
    // Aktualisiere den Cache
    configCache = config

    // Speichere in localStorage
    saveLocalStorageConfig(config)
    console.log("[v0] Tab config saved successfully")
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
