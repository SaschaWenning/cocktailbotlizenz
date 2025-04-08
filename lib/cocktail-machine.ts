"use server"

import type { Cocktail } from "@/types/cocktail"
import type { PumpConfig } from "@/types/pump"
import { updateLevelsAfterCocktail, updateLevelAfterShot } from "@/lib/ingredient-level-service"
import fs from "fs"
import path from "path"

// Skaliert die Zutatenmengen proportional zur gewünschten Gesamtmenge
function scaleRecipe(cocktail: Cocktail, targetSize: number) {
  const currentTotal = cocktail.recipe.reduce((total, item) => total + item.amount, 0)

  // Wenn das aktuelle Volumen 0 ist (was nicht sein sollte), vermeide Division durch 0
  if (currentTotal === 0) return cocktail.recipe

  const scaleFactor = targetSize / currentTotal

  return cocktail.recipe.map((item) => ({
    ...item,
    amount: Math.round(item.amount * scaleFactor),
  }))
}

// Diese Funktion würde auf dem Server laufen und die GPIO-Pins des Raspberry Pi steuern
export async function makeCocktail(cocktail: Cocktail, pumpConfig: PumpConfig[], size = 300) {
  console.log(`Bereite Cocktail zu: ${cocktail.name} (${size}ml)`)

  // Prüfe zuerst, ob genügend von allen Zutaten vorhanden ist
  const levelCheck = await updateLevelsAfterCocktail(cocktail, size)

  if (!levelCheck.success) {
    // Nicht genügend Zutaten vorhanden
    const missingIngredients = levelCheck.insufficientIngredients
    throw new Error(`Nicht genügend Zutaten vorhanden: ${missingIngredients.join(", ")}`)
  }

  // Skaliere das Rezept auf die gewünschte Größe
  const scaledRecipe = scaleRecipe(cocktail, size)

  // Teile die Zutaten in zwei Gruppen auf: Grenadine und alle anderen
  const grenadineItems = scaledRecipe.filter((item) => item.ingredientId === "grenadine")
  const otherItems = scaledRecipe.filter((item) => item.ingredientId !== "grenadine")

  // Aktiviere zuerst alle Zutaten außer Grenadine gleichzeitig
  const otherPumpPromises = otherItems.map((item) => {
    // Finde die Pumpe, die diese Zutat enthält
    const pump = pumpConfig.find((p) => p.ingredient === item.ingredientId)

    if (!pump) {
      console.error(`Keine Pumpe für Zutat ${item.ingredientId} konfiguriert!`)
      return Promise.resolve()
    }

    // Berechne, wie lange die Pumpe laufen muss
    const pumpTimeMs = (item.amount / pump.flowRate) * 1000

    console.log(`Pumpe ${pump.id} (${pump.ingredient}): ${item.amount}ml für ${pumpTimeMs}ms aktivieren`)

    // Aktiviere die Pumpe
    return activatePump(pump.pin, pumpTimeMs)
  })

  // Warte, bis alle Pumpen außer Grenadine aktiviert wurden
  await Promise.all(otherPumpPromises)

  // Wenn Grenadine im Rezept ist, warte 2 Sekunden und füge es dann hinzu
  if (grenadineItems.length > 0) {
    console.log("Warte 2 Sekunden vor dem Hinzufügen von Grenadine...")
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Füge Grenadine hinzu
    for (const item of grenadineItems) {
      const pump = pumpConfig.find((p) => p.ingredient === item.ingredientId)

      if (!pump) {
        console.error(`Keine Pumpe für Zutat ${item.ingredientId} konfiguriert!`)
        continue
      }

      // Berechne, wie lange die Pumpe laufen muss
      const pumpTimeMs = (item.amount / pump.flowRate) * 1000

      console.log(`Pumpe ${pump.id} (${pump.ingredient}): ${item.amount}ml für ${pumpTimeMs}ms aktivieren`)

      // Aktiviere die Pumpe
      await activatePump(pump.pin, pumpTimeMs)
    }
  }

  return { success: true }
}

// Funktion zum Zubereiten eines einzelnen Shots
export async function makeSingleShot(ingredientId: string, amount = 40) {
  console.log(`Bereite Shot zu: ${ingredientId} (${amount}ml)`)

  // Prüfe zuerst, ob genügend von der Zutat vorhanden ist
  const levelCheck = await updateLevelAfterShot(ingredientId, amount)

  if (!levelCheck.success) {
    throw new Error(`Nicht genügend ${ingredientId} vorhanden!`)
  }

  // Finde die Pumpe für diese Zutat
  const pumpConfig = await getPumpConfig()
  const pump = pumpConfig.find((p) => p.ingredient === ingredientId)

  if (!pump) {
    throw new Error(`Keine Pumpe für Zutat ${ingredientId} konfiguriert!`)
  }

  // Berechne, wie lange die Pumpe laufen muss
  const pumpTimeMs = (amount / pump.flowRate) * 1000

  console.log(`Pumpe ${pump.id} (${pump.ingredient}): ${amount}ml für ${pumpTimeMs}ms aktivieren`)

  // Aktiviere die Pumpe
  await activatePump(pump.pin, pumpTimeMs)

  return { success: true }
}

// Diese Funktion würde die GPIO-Pins des Raspberry Pi steuern
async function activatePump(pin: number, durationMs: number) {
  try {
    // In einer echten Implementierung würden wir hier die GPIO-Pins steuern
    // Für diese Demo simulieren wir nur die Verzögerung

    // Simuliere das Einschalten der Pumpe
    console.log(`GPIO Pin ${pin} eingeschaltet`)

    // Warte für die angegebene Dauer
    await new Promise((resolve) => setTimeout(resolve, durationMs))

    // Simuliere das Ausschalten der Pumpe
    console.log(`GPIO Pin ${pin} ausgeschaltet`)

    return true
  } catch (error) {
    console.error(`Fehler beim Aktivieren der Pumpe an Pin ${pin}:`, error)
    throw error
  }
}

// Funktion zum Testen einer einzelnen Pumpe
export async function testPump(pumpId: number) {
  try {
    // In einer echten Implementierung würden wir hier die entsprechende Pumpe für eine kurze Zeit aktivieren
    console.log(`Teste Pumpe ${pumpId}`)

    // Simuliere eine kurze Verzögerung
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return { success: true }
  } catch (error) {
    console.error(`Fehler beim Testen der Pumpe ${pumpId}:`, error)
    throw error
  }
}

// Funktion zur Kalibrierung einer Pumpe (läuft für exakt 2 Sekunden)
export async function calibratePump(pumpId: number, durationMs: number) {
  try {
    // Finde die Pumpe in der Konfiguration
    console.log(`Kalibriere Pumpe ${pumpId} für ${durationMs}ms`)

    // In einer echten Implementierung würden wir hier die entsprechende Pumpe aktivieren
    // und nach der angegebenen Zeit wieder deaktivieren

    // Simuliere die Aktivierung der Pumpe
    console.log(`Pumpe ${pumpId} eingeschaltet`)

    // Warte für die angegebene Dauer
    await new Promise((resolve) => setTimeout(resolve, durationMs))

    // Simuliere das Ausschalten der Pumpe
    console.log(`Pumpe ${pumpId} ausgeschaltet`)

    return { success: true }
  } catch (error) {
    console.error(`Fehler bei der Kalibrierung der Pumpe ${pumpId}:`, error)
    throw error
  }
}

// Funktion zum Reinigen einer Pumpe
export async function cleanPump(pumpId: number, durationMs: number) {
  try {
    console.log(`Reinige Pumpe ${pumpId} für ${durationMs}ms`)

    // In einer echten Implementierung würden wir hier die entsprechende Pumpe aktivieren
    // und nach der angegebenen Zeit wieder deaktivieren

    // Simuliere die Aktivierung der Pumpe
    console.log(`Pumpe ${pumpId} eingeschaltet für Reinigung`)

    // Warte für die angegebene Dauer
    await new Promise((resolve) => setTimeout(resolve, durationMs))

    // Simuliere das Ausschalten der Pumpe
    console.log(`Pumpe ${pumpId} ausgeschaltet nach Reinigung`)

    return { success: true }
  } catch (error) {
    console.error(`Fehler bei der Reinigung der Pumpe ${pumpId}:`, error)
    throw error
  }
}

// Pfad zur JSON-Datei für die Pumpenkonfiguration
const PUMP_CONFIG_PATH = path.join(process.cwd(), "data", "pump-config.json")

// Funktion zum Laden der Pumpenkonfiguration
export async function getPumpConfig(): Promise<PumpConfig[]> {
  try {
    // Prüfe, ob die Datei existiert
    if (fs.existsSync(PUMP_CONFIG_PATH)) {
      // Lese die Datei
      const data = fs.readFileSync(PUMP_CONFIG_PATH, "utf8")
      return JSON.parse(data)
    } else {
      // Wenn die Datei nicht existiert, lade die Standardkonfiguration
      const { pumpConfig } = await import("@/data/pump-config")

      // Speichere die Standardkonfiguration in der JSON-Datei
      fs.mkdirSync(path.dirname(PUMP_CONFIG_PATH), { recursive: true })
      fs.writeFileSync(PUMP_CONFIG_PATH, JSON.stringify(pumpConfig, null, 2), "utf8")

      return pumpConfig
    }
  } catch (error) {
    console.error("Fehler beim Laden der Pumpenkonfiguration:", error)

    // Fallback: Lade die Standardkonfiguration
    const { pumpConfig } = await import("@/data/pump-config")
    return pumpConfig
  }
}

// Funktion zum Speichern der Pumpen-Konfiguration
export async function savePumpConfig(pumpConfig: PumpConfig[]) {
  try {
    console.log("Speichere Pumpen-Konfiguration:", pumpConfig)

    // Stelle sicher, dass das Verzeichnis existiert
    fs.mkdirSync(path.dirname(PUMP_CONFIG_PATH), { recursive: true })

    // Speichere die Konfiguration in der JSON-Datei
    fs.writeFileSync(PUMP_CONFIG_PATH, JSON.stringify(pumpConfig, null, 2), "utf8")

    console.log("Pumpen-Konfiguration erfolgreich gespeichert")
    return { success: true }
  } catch (error) {
    console.error("Fehler beim Speichern der Pumpen-Konfiguration:", error)
    throw error
  }
}

export async function saveRecipe(cocktail: Cocktail) {
  try {
    // In einer echten Implementierung würden wir hier das Rezept in einer Datei oder Datenbank speichern
    console.log("Speichere Rezept:", cocktail)

    // Simuliere eine kurze Verzögerung
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true }
  } catch (error) {
    console.error("Fehler beim Speichern des Rezepts:", error)
    throw error
  }
}
