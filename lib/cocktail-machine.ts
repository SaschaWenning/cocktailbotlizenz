import type { Cocktail } from "@/types/cocktail"
import type { PumpConfig } from "@/types/pump"
import { ingredients } from "@/data/ingredients"
import { pumpConfig as defaultPumpConfig } from "@/data/pump-config"
import { cocktails as defaultCocktails } from "@/data/cocktails"

// In-memory storage for demonstration purposes
let currentCocktails: Cocktail[] = defaultCocktails
let currentPumpConfig: PumpConfig[] = defaultPumpConfig

// Simulate GPIO control
const simulateGpioControl = async (pin: number, duration: number) => {
  console.log(`Simulating GPIO pin ${pin} ON for ${duration}ms`)
  return new Promise((resolve) => setTimeout(resolve, duration))
}

const controlGpio = async (pin: number, duration: number) => {
  console.log(`[v0] Attempting to control GPIO pin ${pin} for ${duration}ms`)

  // Für Raspberry Pi: Echte GPIO-Kontrolle
  if (typeof window === "undefined") {
    try {
      // Versuche echte GPIO-Kontrolle (nur auf Raspberry Pi verfügbar)
      const { exec } = require("child_process")

      // GPIO Pin aktivieren
      console.log(`[v0] Activating GPIO pin ${pin}`)
      await new Promise((resolve, reject) => {
        exec(`echo "${pin}" > /sys/class/gpio/export`, (error) => {
          if (error && !error.message.includes("Device or resource busy")) {
            console.log(`[v0] GPIO export error (might be already exported): ${error.message}`)
          }
          resolve(null)
        })
      })

      // Pin als Output setzen
      await new Promise((resolve) => {
        exec(`echo "out" > /sys/class/gpio/gpio${pin}/direction`, () => resolve(null))
      })

      // Pin auf HIGH setzen
      console.log(`[v0] Setting GPIO pin ${pin} to HIGH`)
      await new Promise((resolve) => {
        exec(`echo "1" > /sys/class/gpio/gpio${pin}/value`, () => resolve(null))
      })

      // Warten für die angegebene Dauer
      await new Promise((resolve) => setTimeout(resolve, duration))

      // Pin auf LOW setzen
      console.log(`[v0] Setting GPIO pin ${pin} to LOW`)
      await new Promise((resolve) => {
        exec(`echo "0" > /sys/class/gpio/gpio${pin}/value`, () => resolve(null))
      })

      console.log(`[v0] GPIO pin ${pin} controlled successfully for ${duration}ms`)
    } catch (error) {
      console.error(`[v0] GPIO control error: ${error}`)
      // Fallback zur Simulation
      console.log(`[v0] Falling back to simulation for GPIO pin ${pin}`)
      await simulateGpioControl(pin, duration)
    }
  } else {
    // Browser: Simulation
    console.log(`[v0] Browser environment detected, using simulation`)
    await simulateGpioControl(pin, duration)
  }
}

// Simulate API calls
const getAllCocktailsFromAPI = async (): Promise<Cocktail[]> => {
  try {
    const response = await fetch("/api/cocktails", {
      method: "GET",
      cache: "no-store",
    })
    if (response.ok) {
      const cocktails = await response.json()
      console.log("[v0] Loaded cocktails from API:", cocktails.length)
      return cocktails
    }
  } catch (error) {
    console.error("[v0] Error loading cocktails from API:", error)
  }

  // Fallback zu Standard-Cocktails
  console.log("[v0] Using default cocktails as fallback")
  return defaultCocktails.map((cocktail) => ({
    ...cocktail,
    recipe: cocktail.recipe.map((item) => ({
      ...item,
      type: (item as any).type || "automatic",
      instruction: (item as any).instruction || "",
    })),
  }))
}

const saveCocktailToAPI = async (cocktail: Cocktail): Promise<void> => {
  try {
    const response = await fetch("/api/cocktails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", cocktail }),
    })
    if (!response.ok) {
      throw new Error("Failed to save cocktail")
    }
    console.log(`[v0] Saved cocktail to API: ${cocktail.name}`)
  } catch (error) {
    console.error("[v0] Error saving cocktail to API:", error)
  }
}

const deleteCocktailFromAPI = async (cocktailId: string): Promise<void> => {
  try {
    const response = await fetch("/api/cocktails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", cocktailId }),
    })
    if (!response.ok) {
      throw new Error("Failed to delete cocktail")
    }
    console.log(`[v0] Deleted cocktail from API: ${cocktailId}`)
  } catch (error) {
    console.error("[v0] Error deleting cocktail from API:", error)
  }
}

export const getAllCocktails = async (): Promise<Cocktail[]> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      console.log("Fetching all cocktails from API")
      const cocktails = await getAllCocktailsFromAPI()
      currentCocktails = cocktails
      resolve(cocktails)
    }, 500)
  })
}

export const getPumpConfig = async (): Promise<PumpConfig[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Fetching pump configuration (simulated)")
      resolve(currentPumpConfig)
    }, 300)
  })
}

export const saveRecipe = async (cocktail: Cocktail): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      await saveCocktailToAPI(cocktail)

      // Aktualisiere auch die lokale Liste
      const index = currentCocktails.findIndex((c) => c.id === cocktail.id)
      if (index > -1) {
        currentCocktails[index] = cocktail
        console.log(`Cocktail "${cocktail.name}" updated locally`)
      } else {
        currentCocktails.push(cocktail)
        console.log(`Cocktail "${cocktail.name}" added locally`)
      }
      resolve()
    }, 500)
  })
}

export const deleteRecipe = async (cocktailId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      await deleteCocktailFromAPI(cocktailId)

      // Entferne auch aus der lokalen Liste
      currentCocktails = currentCocktails.filter((c) => c.id !== cocktailId)
      console.log(`Cocktail with ID "${cocktailId}" deleted locally`)
      resolve()
    }, 300)
  })
}

export const updatePumpConfig = async (config: PumpConfig[]): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentPumpConfig = config
      console.log("Pump configuration updated (simulated)")
      resolve()
    }, 300)
  })
}

export const makeCocktail = async (
  cocktail: Cocktail,
  pumpConfig: PumpConfig[],
  selectedSize: number,
): Promise<void> => {
  console.log(`[v0] Starting to make cocktail: ${cocktail.name} (${selectedSize}ml)`)
  console.log(
    `[v0] Available pumps:`,
    pumpConfig.map((p) => `${p.id}: ${p.ingredient} (enabled: ${p.enabled})`),
  )

  const totalRecipeVolume = cocktail.recipe.reduce((total, item) => total + item.amount, 0)
  if (totalRecipeVolume === 0) {
    throw new Error("Rezept hat keine Zutaten oder Gesamtvolumen ist Null.")
  }
  const scaleFactor = selectedSize / totalRecipeVolume
  console.log(`[v0] Scale factor: ${scaleFactor} (${selectedSize}ml / ${totalRecipeVolume}ml)`)

  for (const item of cocktail.recipe) {
    const ingredient = ingredients.find((i) => i.id === item.ingredientId)
    const scaledAmount = Math.round(item.amount * scaleFactor)

    console.log(`[v0] Processing ingredient: ${item.ingredientId}, amount: ${scaledAmount}ml, type: ${item.type}`)

    if (item.type === "automatic") {
      const pump = pumpConfig.find((p) => p.ingredient === item.ingredientId && p.enabled)
      console.log(`[v0] Looking for pump with ingredient: ${item.ingredientId}`)
      console.log(`[v0] Found pump:`, pump ? `${pump.id} (pin: ${pump.pin}, flowRate: ${pump.flowRate})` : "none")

      if (!pump) {
        throw new Error(`Pumpe für Zutat "${ingredient?.name || item.ingredientId}" nicht konfiguriert.`)
      }

      const duration = (scaledAmount / pump.flowRate) * 1000 // ml / (ml/s) * 1000ms/s = ms
      console.log(
        `[v0] Dispensing ${scaledAmount}ml of ${ingredient?.name || item.ingredientId} using pump ${pump.id} (GPIO ${pump.pin}) for ${duration}ms`,
      )

      await controlGpio(pump.pin, duration)

      if (item.ingredientId === "grenadine") {
        console.log("[v0] Waiting 2 seconds after adding grenadine for proper layering effect...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    } else {
      console.log(
        `[v0] Manuelle Zutat: ${scaledAmount}ml ${ingredient?.name || item.ingredientId}. Anleitung: ${item.instruction || "Keine spezielle Anleitung."}`,
      )
    }
  }

  console.log(`[v0] Finished making cocktail: ${cocktail.name}`)
}

export const activatePumpForDuration = async (
  pumpId: string,
  durationMs: number,
  pumpConfig: PumpConfig[],
): Promise<void> => {
  console.log(`[v0] Activating pump with ID: ${pumpId} for ${durationMs}ms`)
  const pump = pumpConfig.find((p) => p.id.toString() === pumpId)
  if (!pump) {
    throw new Error(`Pumpe mit ID "${pumpId}" nicht gefunden.`)
  }

  console.log(`[v0] Found pump: ${pump.id} (GPIO ${pump.pin})`)
  await controlGpio(pump.pin, durationMs)
  console.log(`[v0] Pump ${pump.id} deactivated.`)
}

export const makeSingleShot = async (
  ingredientId: string,
  amountMl: number,
  pumpConfig: PumpConfig[],
): Promise<void> => {
  console.log(`[v0] Making single shot: ${amountMl}ml of ${ingredientId}`)
  const pump = pumpConfig.find((p) => p.ingredient === ingredientId && p.enabled)
  if (!pump) {
    throw new Error(`Pumpe für Zutat "${ingredientId}" nicht konfiguriert.`)
  }

  const duration = (amountMl / pump.flowRate) * 1000 // ml / (ml/s) * 1000ms/s = ms
  console.log(
    `[v0] Shot preparation: ${amountMl}ml ${ingredientId} (Pump ${pump.id}, GPIO ${pump.pin}) for ${duration}ms`,
  )
  await controlGpio(pump.pin, duration)
  console.log(`[v0] Shot of ${ingredientId} completed.`)
}

export const calibratePump = async (pumpId: string, duration: number): Promise<void> => {
  console.log(`[v0] Calibrating pump with ID: ${pumpId} for ${duration}ms`)
  const pump = currentPumpConfig.find((p) => p.id.toString() === pumpId)
  if (!pump) {
    throw new Error(`Pumpe mit ID "${pumpId}" nicht gefunden.`)
  }

  console.log(`[v0] Calibrating pump ${pump.id} (GPIO ${pump.pin})`)
  await controlGpio(pump.pin, duration)
  console.log(`[v0] Calibration of pump ${pump.id} completed.`)
}

export const cleanPump = async (pumpId: number, duration: number): Promise<void> => {
  console.log(`[v0] Cleaning pump with ID: ${pumpId} for ${duration}ms`)
  const pump = currentPumpConfig.find((p) => p.id === pumpId)
  if (!pump) {
    throw new Error(`Pumpe mit ID "${pumpId}" nicht gefunden.`)
  }

  console.log(`[v0] Cleaning pump ${pump.id} (GPIO ${pump.pin})`)
  await controlGpio(pump.pin, duration)
  console.log(`[v0] Cleaning of pump ${pump.id} completed.`)
}

// Added functions
export const savePumpConfig = async (config: PumpConfig[]): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentPumpConfig = config
      console.log("Pump configuration saved (simulated)")
      resolve()
    }, 300)
  })
}
