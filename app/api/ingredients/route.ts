import { getAllIngredients } from "@/lib/ingredients"

export async function GET() {
  try {
    const ingredients = await getAllIngredients()
    return Response.json(ingredients)
  } catch (error) {
    console.error("Fehler beim Laden der Zutaten:", error)
    return Response.json({ error: "Fehler beim Laden der Zutaten" }, { status: 500 })
  }
}
