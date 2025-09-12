// lib/ingredient-store.ts
"use server"

import { promises as fs } from "fs"
import path from "path"

export type IngredientLevel = {
  ingredientId: string
  capacity: number
  currentAmount: number
  lastRefill: Date | string
}

const DATA_DIR = "/home/pi/cocktailbot/cocktailbot-main/data"
const FILE = path.join(DATA_DIR, "ingredient-levels-data.json")

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

function revive(levels: any[]): IngredientLevel[] {
  return (levels ?? []).map((l) => ({
    ...l,
    lastRefill: l?.lastRefill ? new Date(l.lastRefill) : new Date(),
  }))
}

// Atomar schreiben: erst .tmp, dann rename
async function atomicWriteJSON(filePath: string, data: unknown) {
  const tmp = `${filePath}.tmp`
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8")
  await fs.rename(tmp, filePath)
}

export async function readLevels(initials: IngredientLevel[]): Promise<IngredientLevel[]> {
  await ensureDir()
  try {
    const raw = await fs.readFile(FILE, "utf8")
    const json = JSON.parse(raw)
    return revive(json)
  } catch {
    // Erststart: Initialwerte persistieren
    await writeLevels(initials)
    return revive(initials)
  }
}

export async function writeLevels(levels: IngredientLevel[]) {
  await ensureDir()
  const serializable = levels.map((l) => ({
    ...l,
    lastRefill: new Date(l.lastRefill).toISOString(),
  }))
  await atomicWriteJSON(FILE, serializable)
}
