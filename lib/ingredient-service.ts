import type { IngredientLevel } from "./ingredient-store"
import { readLevels, writeLevels } from "./ingredient-store"
import { initialIngredientLevels } from "@/data/ingredient-levels"

let cache: IngredientLevel[] | null = null

function init() {
  if (!cache) cache = readLevels(initialIngredientLevels)
}

export function getIngredientLevels(): IngredientLevel[] {
  init()
  return cache!
}

export function setCapacity(ingredientId: string, capacity: number): IngredientLevel[] {
  init()
  const idx = cache!.findIndex((l) => l.ingredientId === ingredientId)
  if (idx === -1) {
    cache!.push({ ingredientId, capacity, currentAmount: capacity, lastRefill: new Date() })
  } else {
    const it = cache![idx]
    const currentAmount = Math.min(it.currentAmount, capacity)
    cache![idx] = { ...it, capacity, currentAmount }
  }
  writeLevels(cache!)
  return cache!
}

export function setCurrentAmount(ingredientId: string, ml: number): IngredientLevel[] {
  init()
  const idx = cache!.findIndex((l) => l.ingredientId === ingredientId)
  if (idx !== -1) {
    cache![idx] = { ...cache![idx], currentAmount: Math.max(0, ml) }
    writeLevels(cache!)
  }
  return cache!
}

export function refill(ingredientId: string): IngredientLevel[] {
  init()
  const idx = cache!.findIndex((l) => l.ingredientId === ingredientId)
  if (idx !== -1) {
    const it = cache![idx]
    cache![idx] = { ...it, currentAmount: it.capacity, lastRefill: new Date() }
    writeLevels(cache!)
  }
  return cache!
}

export function refillAll(): IngredientLevel[] {
  init()
  cache = cache!.map((l) => ({ ...l, currentAmount: l.capacity, lastRefill: new Date() }))
  writeLevels(cache!)
  return cache!
}
