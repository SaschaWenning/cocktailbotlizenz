// lib/ingredient-service.ts
"use server"

import type { IngredientLevel } from "./ingredient-store"
import { readLevels, writeLevels } from "./ingredient-store"
import { initialIngredientLevels } from "@/data/ingredient-levels"

let cache: IngredientLevel[] | null = null

async function init() {
  if (!cache) cache = await readLevels(initialIngredientLevels)
}

export async function getIngredientLevels(): Promise<IngredientLevel[]> {
  await init()
  return cache!
}

export async function setCapacity(ingredientId: string, capacity: number) {
  await init()
  const idx = cache!.findIndex((l) => l.ingredientId === ingredientId)
  if (idx === -1) {
    cache!.push({ ingredientId, capacity, currentAmount: capacity, lastRefill: new Date() })
  } else {
    const it = cache![idx]
    const currentAmount = Math.min(it.currentAmount, capacity)
    cache![idx] = { ...it, capacity, currentAmount }
  }
  await writeLevels(cache!)
  return cache!
}

export async function setCurrentAmount(ingredientId: string, ml: number) {
  await init()
  const idx = cache!.findIndex((l) => l.ingredientId === ingredientId)
  if (idx !== -1) {
    cache![idx] = { ...cache![idx], currentAmount: Math.max(0, ml) }
    await writeLevels(cache!)
  }
  return cache!
}

export async function refill(ingredientId: string) {
  await init()
  const idx = cache!.findIndex((l) => l.ingredientId === ingredientId)
  if (idx !== -1) {
    const it = cache![idx]
    cache![idx] = { ...it, currentAmount: it.capacity, lastRefill: new Date() }
    await writeLevels(cache!)
  }
  return cache!
}

export async function refillAll() {
  await init()
  cache = cache!.map((l) => ({ ...l, currentAmount: l.capacity, lastRefill: new Date() }))
  await writeLevels(cache!)
  return cache!
}
