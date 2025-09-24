"use server"

import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")

// Stelle sicher, dass das data Verzeichnis existiert
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Generische Funktionen zum Laden und Speichern von JSON-Daten
export async function loadJsonData<T>(filename: string, defaultValue: T): Promise<T> {
  try {
    ensureDataDir()
    const filePath = path.join(DATA_DIR, filename)

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8")
      return JSON.parse(data)
    }

    // Wenn Datei nicht existiert, speichere den Standardwert
    await saveJsonData(filename, defaultValue)
    return defaultValue
  } catch (error) {
    console.error(`Error loading ${filename}:`, error)
    return defaultValue
  }
}

export async function saveJsonData<T>(filename: string, data: T): Promise<void> {
  try {
    ensureDataDir()
    const filePath = path.join(DATA_DIR, filename)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8")
    console.log(`[v0] Successfully saved ${filename}`)
  } catch (error) {
    console.error(`Error saving ${filename}:`, error)
    throw error
  }
}

// Spezifische Datentypen
export interface PersistentData {
  standardSizes: number[]
  hiddenCocktails: string[]
  customPassword: string
  customIngredients: Array<{
    id: string
    name: string
    alcoholic: boolean
  }>
  ingredientLevels: Array<{
    pumpId: number
    ingredient: string
    ingredientId: string
    currentLevel: number
    containerSize: number
    lastUpdated: string
  }>
  tabConfig: {
    tabs: Array<{
      id: string
      name: string
      location: "main" | "service"
      passwordProtected: boolean
      alwaysVisible?: boolean
    }>
  }
}

// Standard-Werte
const DEFAULT_DATA: PersistentData = {
  standardSizes: [200, 300, 400],
  hiddenCocktails: [],
  customPassword: "",
  customIngredients: [],
  ingredientLevels: Array.from({ length: 18 }, (_, i) => ({
    pumpId: i + 1,
    ingredient: `Zutat ${i + 1}`,
    ingredientId: `ingredient-${i + 1}`,
    currentLevel: 1000,
    containerSize: 1000,
    lastUpdated: new Date().toISOString(),
  })),
  tabConfig: {
    tabs: [
      { id: "cocktails", name: "Cocktails", location: "main", passwordProtected: false },
      { id: "virgin", name: "Alkoholfrei", location: "main", passwordProtected: false },
      { id: "shots", name: "Shots", location: "main", passwordProtected: false },
      { id: "recipe-creator", name: "Neues Rezept", location: "service", passwordProtected: true },
      { id: "levels", name: "Füllstände", location: "service", passwordProtected: true },
      { id: "ingredients", name: "Zutaten", location: "service", passwordProtected: true },
    ],
  },
}

// Lade alle persistenten Daten
export async function loadAllPersistentData(): Promise<PersistentData> {
  return await loadJsonData("persistent-data.json", DEFAULT_DATA)
}

// Speichere alle persistenten Daten
export async function saveAllPersistentData(data: PersistentData): Promise<void> {
  await saveJsonData("persistent-data.json", data)
}

// Spezifische Funktionen für einzelne Datentypen
export async function loadStandardSizes(): Promise<number[]> {
  const data = await loadAllPersistentData()
  return data.standardSizes
}

export async function saveStandardSizes(sizes: number[]): Promise<void> {
  const data = await loadAllPersistentData()
  data.standardSizes = sizes
  await saveAllPersistentData(data)
}

export async function loadHiddenCocktails(): Promise<string[]> {
  const data = await loadAllPersistentData()
  return data.hiddenCocktails
}

export async function saveHiddenCocktails(hiddenCocktails: string[]): Promise<void> {
  const data = await loadAllPersistentData()
  data.hiddenCocktails = hiddenCocktails
  await saveAllPersistentData(data)
}

export async function loadCustomPassword(): Promise<string> {
  const data = await loadAllPersistentData()
  return data.customPassword
}

export async function saveCustomPassword(password: string): Promise<void> {
  const data = await loadAllPersistentData()
  data.customPassword = password
  await saveAllPersistentData(data)
}

export async function loadCustomIngredients(): Promise<Array<{ id: string; name: string; alcoholic: boolean }>> {
  const data = await loadAllPersistentData()
  return data.customIngredients
}

export async function saveCustomIngredients(
  ingredients: Array<{ id: string; name: string; alcoholic: boolean }>,
): Promise<void> {
  const data = await loadAllPersistentData()
  data.customIngredients = ingredients
  await saveAllPersistentData(data)
}

export async function loadIngredientLevels(): Promise<
  Array<{
    pumpId: number
    ingredient: string
    ingredientId: string
    currentLevel: number
    containerSize: number
    lastUpdated: string
  }>
> {
  const data = await loadAllPersistentData()
  return data.ingredientLevels
}

export async function saveIngredientLevels(
  levels: Array<{
    pumpId: number
    ingredient: string
    ingredientId: string
    currentLevel: number
    containerSize: number
    lastUpdated: string
  }>,
): Promise<void> {
  const data = await loadAllPersistentData()
  data.ingredientLevels = levels
  await saveAllPersistentData(data)
}

export async function loadTabConfig(): Promise<{
  tabs: Array<{
    id: string
    name: string
    location: "main" | "service"
    passwordProtected: boolean
    alwaysVisible?: boolean
  }>
}> {
  const data = await loadAllPersistentData()
  return data.tabConfig
}

export async function saveTabConfig(tabConfig: {
  tabs: Array<{
    id: string
    name: string
    location: "main" | "service"
    passwordProtected: boolean
    alwaysVisible?: boolean
  }>
}): Promise<void> {
  const data = await loadAllPersistentData()
  data.tabConfig = tabConfig
  await saveAllPersistentData(data)
}
