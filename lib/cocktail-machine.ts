"use server"

import type { Cocktail } from "@/types/cocktail"
import type { PumpConfig } from "@/types/pump"
import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { promisify } from "util"

const execPromise = promisify(exec)

const updateLevelsAfterCocktailServer = async (ingredients: { pumpId: number; amount: number }[]): Promise<void> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/ingredient-levels/update`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      },
    )

    if (response.ok) {
      const data = await response.json()
      console.log("[v0] Füllstände erfolgreich aktualisiert:", data.levels?.length || 0, "Levels")
    } else {
      console.error("Fehler beim Aktualisieren der Füllstände:", response.statusText)
    }
  } catch (error) {
    console.error("Error updating levels:", error)
  }
}

const updateLevelAfterShotServer = async (pumpId: number, amount: number): Promise<void> => {
  await updateLevelsAfterCocktailServer([{ pumpId, amount }])
}

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

  // Skaliere das Rezept auf die gewünschte Größe
  const scaledRecipe = scaleRecipe(cocktail, size)

  // Teile die Zutaten in zwei Gruppen auf: Grenadine und alle anderen
  const grenadineItems = scaledRecipe.filter((item) => item.ingredientId === "grenadine")
  const otherItems = scaledRecipe.filter((item) => item.ingredientId !== "grenadine")

  // Sammle Pumpen-Updates für Level-Reduktion
  const levelUpdates: { pumpId: number; amount: number }[] = []

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

    // Füge zur Level-Update-Liste hinzu
    levelUpdates.push({ pumpId: pump.id, amount: item.amount })

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

      // Füge zur Level-Update-Liste hinzu
      levelUpdates.push({ pumpId: pump.id, amount: item.amount })

      // Aktiviere die Pumpe
      await activatePump(pump.pin, pumpTimeMs)
    }
  }

  // Aktualisiere die Füllstände
  await updateLevelsAfterCocktailServer(levelUpdates)

  return { success: true }
}

// Funktion zum Zubereiten eines einzelnen Shots
export async function makeSingleShot(ingredientId: string, amount = 40, pumpConfig: PumpConfig[]) {
  console.log(`Bereite Shot zu: ${ingredientId} (${amount}ml)`)

  // Finde die Pumpe für diese Zutat
  const pump = pumpConfig.find((p) => p.ingredient === ingredientId)

  if (!pump) {
    throw new Error(`Keine Pumpe für Zutat ${ingredientId} konfiguriert!`)
  }

  // Berechne, wie lange die Pumpe laufen muss
  const pumpTimeMs = (amount / pump.flowRate) * 1000

  console.log(`Pumpe ${pump.id} (${pump.ingredient}): ${amount}ml für ${pumpTimeMs}ms aktivieren`)

  // Aktiviere die Pumpe
  await activatePump(pump.pin, pumpTimeMs)

  // Aktualisiere den Füllstand
  await updateLevelAfterShotServer(pump.id, amount)

  return { success: true }
}

// Diese Funktion aktiviert eine Pumpe für eine bestimmte Zeit
async function activatePump(pin: number, durationMs: number) {
  try {
    console.log(`Aktiviere Pumpe an Pin ${pin} für ${durationMs}ms`)

    // Verwende das Python-Skript zur Steuerung der Pumpe
    const PUMP_CONTROL_SCRIPT = path.join(process.cwd(), "pump_control.py")
    const roundedDuration = Math.round(durationMs)

    await execPromise(`python3 ${PUMP_CONTROL_SCRIPT} activate ${pin} ${roundedDuration}`)

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

    const pumpConfig = await getPumpConfig()
    const pump = pumpConfig.find((p) => p.id === pumpId)

    if (!pump) {
      throw new Error(`Pumpe mit ID ${pumpId} nicht gefunden`)
    }

    console.log(`Gefundene Pumpe: ${JSON.stringify(pump)}`)

    // Aktiviere die Pumpe über das Python-Skript
    const PUMP_CONTROL_SCRIPT = path.join(process.cwd(), "pump_control.py")
    const roundedDuration = Math.round(durationMs)

    await execPromise(`python3 ${PUMP_CONTROL_SCRIPT} activate ${pump.pin} ${roundedDuration}`)

    console.log(`Pumpe ${pumpId} erfolgreich kalibriert`)

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

    // Finde die Pumpe in der Konfiguration
    const pumpConfig = await getPumpConfig()
    const pump = pumpConfig.find((p) => p.id === pumpId)

    if (!pump) {
      throw new Error(`Pumpe mit ID ${pumpId} nicht gefunden`)
    }

    // Aktiviere die Pumpe über das Python-Skript
    const PUMP_CONTROL_SCRIPT = path.join(process.cwd(), "pump_control.py")
    const roundedDuration = Math.round(durationMs)

    await execPromise(`python3 ${PUMP_CONTROL_SCRIPT} activate ${pump.pin} ${roundedDuration}`)

    console.log(`Pumpe ${pumpId} erfolgreich gereinigt`)

    return { success: true }
  } catch (error) {
    console.error(`Fehler bei der Reinigung der Pumpe ${pumpId}:`, error)
    throw error
  }
}

// Pfad zur JSON-Datei für die Pumpenkonfiguration
const PUMP_CONFIG_PATH = path.join(process.cwd(), "data", "pump-config.json")

// Pfad zur JSON-Datei für die Cocktail-Rezepte
const COCKTAILS_PATH = path.join(process.cwd(), "data", "custom-cocktails.json")

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

// Funktion zum Laden aller Cocktails (Standard + benutzerdefinierte)
export async function getAllCocktails(): Promise<Cocktail[]> {
  try {
    // Lade die Standard-Cocktails
    const { cocktails: defaultCocktails } = await import("@/data/cocktails")

    // Keine zusätzlichen Cocktails definieren
    const additionalCocktails: Cocktail[] = []

    // Erstelle eine Map für die Cocktails, um Duplikate zu vermeiden
    const cocktailMap = new Map<string, Cocktail>()

    // Füge zuerst die Standard-Cocktails hinzu und ersetze "rum" durch "brauner rum"
    for (const cocktail of defaultCocktails) {
      // Überspringe den ursprünglichen Malibu Ananas, da wir eine aktualisierte Version haben
      // Überspringe auch Gin Tonic und Cuba Libre
      if (cocktail.id === "malibu-ananas" || cocktail.id === "gin-tonic" || cocktail.id === "cuba-libre") continue

      // Erstelle eine Kopie des Cocktails
      const updatedCocktail = { ...cocktail }

      // Aktualisiere die Zutaten-Textliste
      updatedCocktail.ingredients = cocktail.ingredients.map((ingredient) =>
        ingredient.includes("Rum") && !ingredient.includes("Brauner Rum")
          ? ingredient.replace("Rum", "Brauner Rum")
          : ingredient,
      )

      // Füge den aktualisierten Cocktail zur Map hinzu
      cocktailMap.set(cocktail.id, updatedCocktail)
    }

    // Füge die zusätzlichen Cocktails hinzu (in diesem Fall leer)
    for (const cocktail of additionalCocktails) {
      cocktailMap.set(cocktail.id, cocktail)
    }

    // Prüfe, ob die Datei für benutzerdefinierte Cocktails existiert
    if (fs.existsSync(COCKTAILS_PATH)) {
      // Lese die Datei
      const data = fs.readFileSync(COCKTAILS_PATH, "utf8")
      const customCocktails: Cocktail[] = JSON.parse(data)

      // Aktualisiere und füge benutzerdefinierte Cocktails hinzu
      for (const cocktail of customCocktails) {
        // Erstelle eine Kopie des Cocktails
        const updatedCocktail = { ...cocktail }

        // Aktualisiere die Zutaten-Textliste
        updatedCocktail.ingredients = cocktail.ingredients.map((ingredient) =>
          ingredient.includes("Rum") && !ingredient.includes("Brauner Rum")
            ? ingredient.replace("Rum", "Brauner Rum")
            : ingredient,
        )

        // Füge den aktualisierten Cocktail zur Map hinzu
        cocktailMap.set(cocktail.id, updatedCocktail)
      }
    }

    // Konvertiere die Map zurück in ein Array
    return Array.from(cocktailMap.values())
  } catch (error) {
    console.error("Fehler beim Laden der Cocktails:", error)

    // Fallback: Lade nur die Standard-Cocktails
    const { cocktails } = await import("@/data/cocktails")
    return cocktails
  }
}

// Funktion zum Speichern eines Cocktail-Rezepts
export async function saveRecipe(cocktail: Cocktail) {
  try {
    console.log("Speichere Rezept:", cocktail)

    // Stelle sicher, dass das Verzeichnis existiert
    fs.mkdirSync(path.dirname(COCKTAILS_PATH), { recursive: true })

    // Lade bestehende benutzerdefinierte Cocktails oder erstelle ein leeres Array
    let customCocktails: Cocktail[] = []
    if (fs.existsSync(COCKTAILS_PATH)) {
      const data = fs.readFileSync(COCKTAILS_PATH, "utf8")
      customCocktails = JSON.parse(data)
    }

    // Prüfe, ob der Cocktail bereits existiert
    const index = customCocktails.findIndex((c) => c.id === cocktail.id)

    if (index !== -1) {
      // Aktualisiere den bestehenden Cocktail
      customCocktails[index] = cocktail
    } else {
      // Füge den neuen Cocktail hinzu
      customCocktails.push(cocktail)
    }

    // Speichere die aktualisierten Cocktails
    fs.writeFileSync(COCKTAILS_PATH, JSON.stringify(customCocktails, null, 2), "utf8")

    console.log("Rezept erfolgreich gespeichert")
    return { success: true }
  } catch (error) {
    console.error("Fehler beim Speichern des Rezepts:", error)
    throw error
  }
}

// Funktion zum Löschen eines Cocktail-Rezepts
export async function deleteRecipe(cocktailId: string) {
  try {
    console.log(`Lösche Rezept mit ID: ${cocktailId}`)

    // Prüfe, ob die Datei existiert
    if (!fs.existsSync(COCKTAILS_PATH)) {
      return { success: false, error: "Keine benutzerdefinierten Cocktails gefunden" }
    }

    // Lade bestehende benutzerdefinierte Cocktails
    const data = fs.readFileSync(COCKTAILS_PATH, "utf8")
    const customCocktails: Cocktail[] = JSON.parse(data)

    // Prüfe, ob der Cocktail existiert
    const index = customCocktails.findIndex((c) => c.id === cocktailId)

    if (index === -1) {
      return { success: false, error: `Cocktail mit ID ${cocktailId} nicht gefunden` }
    }

    // Entferne den Cocktail
    customCocktails.splice(index, 1)

    // Speichere die aktualisierten Cocktails
    fs.writeFileSync(COCKTAILS_PATH, JSON.stringify(customCocktails, null, 2), "utf8")

    console.log(`Rezept mit ID ${cocktailId} erfolgreich gelöscht`)
    return { success: true }
  } catch (error) {
    console.error("Fehler beim Löschen des Rezepts:", error)
    throw error
  }
}

export const updatePumpConfig = async (config: PumpConfig[]): Promise<void> => {
  await savePumpConfig(config)
}

export const activatePumpForDuration = async (
  pumpId: string,
  durationMs: number,
  pumpConfig: PumpConfig[],
): Promise<void> => {
  console.log(`Aktiviere Pumpe mit ID: ${pumpId} für ${durationMs}ms`)
  const pump = pumpConfig.find((p) => p.id.toString() === pumpId)
  if (!pump) {
    throw new Error(`Pumpe mit ID "${pumpId}" nicht gefunden.`)
  }

  console.log(`Gefundene Pumpe: ${pump.id} (GPIO ${pump.pin})`)
  await activatePump(pump.pin, durationMs)
  console.log(`Pumpe ${pump.id} deaktiviert.`)
}
