const STORAGE_KEY = "hidden-cocktails"
const EVENT = "hidden:updated"

export function onHiddenUpdated(handler: () => void) {
  const cb = () => handler()
  if (typeof window !== "undefined") window.addEventListener(EVENT, cb as any)
  return () => {
    if (typeof window !== "undefined") window.removeEventListener(EVENT, cb as any)
  }
}

export function getHidden(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export async function saveHidden(hidden: string[]): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hidden))
  }
  try {
    const res = await fetch("/api/hidden-cocktails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hidden),
    })
    if (res.ok && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(EVENT))
    }
  } catch (e) {
    console.warn("[hidden] server sync failed – keeping local copy", e)
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT))
  }
}
