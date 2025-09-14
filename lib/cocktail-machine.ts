import type { Cocktail } from "@/types/cocktail"
import type { PumpConfig } from "@/types/pump"
import { ingredients } from "@/data/ingredients"
import { pumpConfig as defaultPumpConfig } from "@/data/pump-config"
import { cocktails as defaultCocktails } from "@/data/cocktails"

// In-memory storage for demonstration purposes
const DELETED_COCKTAILS_KEY = "deleted-cocktails"

// Funktion zum Laden der gelöschten Cocktail-IDs aus localStorage
const getDeletedCocktailIds = (): string[] => {
  if (typeof window === "undefined") return []
  try {
    const deleted = localStorage.getItem(DELETED_COCKTAILS_KEY)
    return deleted ? JSON.parse(deleted) : []
  } catch (error) {
    console.error("Fehler beim Laden der gelöschten Cocktails:", error)
    return []
  }
}

// Funktion zum Speichern der gelöschten Cocktail-IDs in localStorage
const saveDeletedCocktailIds = (deletedIds: string[]): void => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(DELETED_COCKTAILS_KEY, JSON.stringify(deletedIds))
  } catch (error) {
    console.error("Fehler beim Speichern der gelöschten Cocktails:", error)
  }
}

let currentCocktails: Cocktail[] = defaultCocktails
  .filter((cocktail) => !getDeletedCocktailIds().includes(cocktail.id))
  .map((cocktail) => ({
    ...cocktail,
    recipe: cocktail.recipe.map((item) => ({
      ...item,
      type: (item as any).type || "automatic",
      instruction: (item as any).instruction || "",
    })),
  }))

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
export const getAllCocktails = async (): Promise<Cocktail[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Fetching all cocktails (simulated)")
      const deletedIds = getDeletedCocktailIds()

      // Immer von den ursprünglichen defaultCocktails ausgehen und gelöschte herausfiltern
      const filteredCocktails = defaultCocktails
        .filter((cocktail) => !deletedIds.includes(cocktail.id))
        .map((cocktail) => ({
          ...cocktail,
          recipe: cocktail.recipe.map((item) => ({
            ...item,
            type: (item as any).type || "automatic",
            instruction: (item as any).instruction || "",
          })),
        }))

      // Aktualisiere auch currentCocktails für Konsistenz
      currentCocktails = filteredCocktails

      resolve(filteredCocktails)
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
    setTimeout(() => {
      const index = currentCocktails.findIndex((c) => c.id === cocktail.id)
      if (index > -1) {
        currentCocktails[index] = cocktail
        console.log(`Cocktail "${cocktail.name}" updated (simulated)`)
      } else {
        currentCocktails.push(cocktail)
        console.log(`Cocktail "${cocktail.name}" added (simulated)`)
      }
      resolve()
    }, 500)
  })
}

export const deleteRecipe = async (cocktailId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const deletedIds = getDeletedCocktailIds()
      if (!deletedIds.includes(cocktailId)) {
        deletedIds.push(cocktailId)
        saveDeletedCocktailIds(deletedIds)
      }

      // Entferne auch aus der aktuellen Liste
      currentCocktails = currentCocktails.filter((c) => c.id !== cocktailId)
      console.log(`Cocktail with ID "${cocktailId}" deleted permanently (simulated)`)
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

  const usedIngredients: { ingredientId: string; amount: number }[] = []

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

      usedIngredients.push({ ingredientId: item.ingredientId, amount: scaledAmount })

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

  try {
    console.log(`[v0] Updating ingredient levels after cocktail preparation`)
    const response = await fetch("/api/ingredient-levels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateAfterCocktail",
        usedIngredients,
      }),
    })

    if (!response.ok) {
      console.error(`[v0] Failed to update ingredient levels: ${response.statusText}`)
    } else {
      console.log(`[v0] Ingredient levels updated successfully`)
    }
  } catch (error) {
    console.error(`[v0] Error updating ingredient levels:`, error)
  }

  console.log(`[v0] Finished making cocktail: ${cocktail.name}`)
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

  try {
    console.log(`[v0] Updating ingredient levels after shot`)
    const response = await fetch("/api/ingredient-levels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateAfterCocktail",
        usedIngredients: [{ ingredientId, amount: amountMl }],
      }),
    })

    if (!response.ok) {
      console.error(`[v0] Failed to update ingredient levels: ${response.statusText}`)
    } else {
      console.log(`[v0] Ingredient levels updated successfully`)
    }
  } catch (error) {
    console.error(`[v0] Error updating ingredient levels:`, error)
  }

  console.log(`[v0] Shot of ${ingredientId} completed.`)
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
