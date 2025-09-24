const STORAGE_KEY = "shot-sizes"
const EVENT = "shots:updated"

export type ShotSize = { id: string; size: number }

export function onShotSizesUpdated(handler: () => void) {
  const cb = () => handler()
  if (typeof window !== "undefined") window.addEventListener(EVENT, cb as any)
  return () => {
    if (typeof window !== "undefined") window.removeEventListener(EVENT, cb as any)
  }
}

export function getShotSizes(): ShotSize[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export async function saveShotSizes(sizes: ShotSize[]): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes))
  }
  try {
    const res = await fetch("/api/shot-sizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sizes),
    })
    if (res.ok && typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT))
  } catch (e) {
    console.warn("[shot-sizes] server sync failed – keeping local copy", e)
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT))
  }
}
