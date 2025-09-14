import { makeSingleShot } from "@/lib/cocktail-machine"

export async function POST(request: Request) {
  try {
    const { ingredientId, amount, pumpConfig } = await request.json()

    const result = await makeSingleShot(ingredientId, amount, pumpConfig)
    return Response.json(result)
  } catch (error) {
    console.error("Fehler bei der Shot-Zubereitung:", error)
    return Response.json({ error: error instanceof Error ? error.message : "Unbekannter Fehler" }, { status: 500 })
  }
}
