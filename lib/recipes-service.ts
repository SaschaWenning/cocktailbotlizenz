const STORAGE_KEY = "recipes"
const EVENT = "recipes:updated"

export type Recipe = {
  id: string
  name: string
  steps: Array<{ ingredientId: string; amount: number }>
  isVirgin?: boolean
}

export function onRecipesUpdated(handler: () => void) {
  const cb = () => handler()
  if (typeof window !== "undefined") {
    window.addEventListener(EVENT, cb as any)
  }
  return () => {
    if (typeof window !== "undefined") window.removeEventListener(EVENT, cb as any)
  }
}

export function getRecipes(): Recipe[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export async function saveRecipes(recipes: Recipe[]): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
  }
  try {
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipes),
    })
    if (res.ok && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(EVENT))
    }
  } catch (e) {
    console.warn("[recipes] server sync failed – keeping local copy", e)
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT))
  }
}
