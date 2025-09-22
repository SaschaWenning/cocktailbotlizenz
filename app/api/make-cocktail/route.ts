import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { cocktail, pumpConfig, size } = await request.json()

    console.log(`[v0] Bereite Cocktail zu: ${cocktail.name} (${size}ml)`)

    // Skaliere das Rezept auf die gewünschte Größe
    const currentTotal = cocktail.recipe.reduce((total: number, item: any) => total + item.amount, 0)
    const scaleFactor = currentTotal === 0 ? 1 : size / currentTotal
    const scaledRecipe = cocktail.recipe.map((item: any) => ({
      ...item,
      amount: Math.round(item.amount * scaleFactor),
    }))

    // Simuliere Pumpen-Aktivierung mit Delays
    console.log(`[v0] Starte Zubereitung von ${cocktail.name}...`)

    // Teile die Zutaten in zwei Gruppen auf: Grenadine und alle anderen
    const grenadineItems = scaledRecipe.filter((item: any) => item.ingredientId === "grenadine")
    const otherItems = scaledRecipe.filter((item: any) => item.ingredientId !== "grenadine")

    // Simuliere gleichzeitige Aktivierung aller Pumpen außer Grenadine
    const otherPumpPromises = otherItems.map(async (item: any) => {
      const pump = pumpConfig.find((p: any) => p.ingredient === item.ingredientId)

      if (!pump) {
        console.log(`[v0] Keine Pumpe für Zutat ${item.ingredientId} konfiguriert!`)
        return
      }

      const pumpTimeMs = (item.amount / pump.flowRate) * 1000
      console.log(`[v0] Pumpe ${pump.id} (${pump.ingredient}): ${item.amount}ml für ${pumpTimeMs}ms`)

      // Simuliere Pumpen-Laufzeit
      await new Promise((resolve) => setTimeout(resolve, Math.min(pumpTimeMs, 100))) // Max 100ms für v0
    })

    // Warte auf alle anderen Pumpen
    await Promise.all(otherPumpPromises)

    // Wenn Grenadine im Rezept ist, warte kurz und füge es dann hinzu
    if (grenadineItems.length > 0) {
      console.log("[v0] Warte kurz vor dem Hinzufügen von Grenadine...")
      await new Promise((resolve) => setTimeout(resolve, 100)) // Kurze Pause für v0

      for (const item of grenadineItems) {
        const pump = pumpConfig.find((p: any) => p.ingredient === item.ingredientId)

        if (!pump) {
          console.log(`[v0] Keine Pumpe für Zutat ${item.ingredientId} konfiguriert!`)
          continue
        }

        const pumpTimeMs = (item.amount / pump.flowRate) * 1000
        console.log(`[v0] Pumpe ${pump.id} (${pump.ingredient}): ${item.amount}ml für ${pumpTimeMs}ms`)

        // Simuliere Grenadine-Pumpe
        await new Promise((resolve) => setTimeout(resolve, Math.min(pumpTimeMs, 50))) // Max 50ms für v0
      }
    }

    console.log(`[v0] ${cocktail.name} erfolgreich zubereitet!`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error making cocktail:", error)
    return NextResponse.json({ success: false, error: "Failed to make cocktail" }, { status: 500 })
  }
}
