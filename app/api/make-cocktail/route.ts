import { type NextRequest, NextResponse } from "next/server"
import type { PumpConfig } from "@/types/pump"

export async function POST(request: NextRequest) {
  try {
    const { cocktail, pumpConfig, size } = await request.json()

    console.log(`Bereite Cocktail zu: ${cocktail.name} (${size}ml)`)

    // Skaliere das Rezept auf die gewünschte Größe
    const currentTotal = cocktail.recipe.reduce((total: number, item: any) => total + item.amount, 0)
    const scaleFactor = currentTotal === 0 ? 1 : size / currentTotal
    const scaledRecipe = cocktail.recipe.map((item: any) => ({
      ...item,
      amount: Math.round(item.amount * scaleFactor),
    }))

    // Simuliere Cocktail-Zubereitung (für Browser-Umgebung)
    for (const item of scaledRecipe) {
      const pump = pumpConfig.find((p: PumpConfig) => p.ingredient === item.ingredientId)

      if (pump) {
        const pumpTimeMs = (item.amount / pump.flowRate) * 1000
        console.log(`Pumpe ${pump.id} (${pump.ingredient}): ${item.amount}ml für ${pumpTimeMs}ms aktivieren`)
      } else {
        console.log(`Keine Pumpe für Zutat ${item.ingredientId} konfiguriert!`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error making cocktail:", error)
    return NextResponse.json({ success: false, error: "Failed to make cocktail" }, { status: 500 })
  }
}
