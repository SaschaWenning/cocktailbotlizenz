import type { Cocktail } from "@/types/cocktail"
import type { PumpConfig } from "@/types/pump"

// Client-side API wrapper functions
export async function makeCocktail(cocktail: Cocktail, pumpConfig: PumpConfig[], size = 300) {
  const response = await fetch("/api/cocktail-machine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "makeCocktail", cocktail, pumpConfig, size }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to make cocktail")
  }

  return response.json()
}

export async function makeSingleShot(ingredientId: string, amount = 40, pumpConfig?: PumpConfig[]) {
  const response = await fetch("/api/cocktail-machine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "makeSingleShot", ingredientId, amount }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to make shot")
  }

  return response.json()
}

export async function getAllCocktails(): Promise<Cocktail[]> {
  const response = await fetch("/api/cocktail-machine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "getAllCocktails" }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to get cocktails")
  }

  return response.json()
}

export async function saveRecipe(cocktail: Cocktail) {
  const response = await fetch("/api/cocktail-machine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "saveRecipe", cocktail }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to save recipe")
  }

  return response.json()
}

export async function deleteRecipe(cocktailId: string) {
  const response = await fetch("/api/cocktail-machine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "deleteRecipe", cocktailId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete recipe")
  }

  return response.json()
}

export async function getPumpConfig(): Promise<PumpConfig[]> {
  const response = await fetch("/api/cocktail-machine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "getPumpConfig" }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to get pump config")
  }

  return response.json()
}

export async function savePumpConfig(pumpConfig: PumpConfig[]) {
  const response = await fetch("/api/cocktail-machine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "savePumpConfig", pumpConfig }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to save pump config")
  }

  return response.json()
}

export async function calibratePump(pumpId: number, durationMs: number) {
  const response = await fetch("/api/cocktail-machine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "calibratePump", pumpId, durationMs }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to calibrate pump")
  }

  return response.json()
}

export async function cleanPump(pumpId: number, durationMs: number) {
  const response = await fetch("/api/cocktail-machine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "cleanPump", pumpId, durationMs }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to clean pump")
  }

  return response.json()
}
