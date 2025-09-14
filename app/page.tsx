"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Cocktail } from "@/types/cocktail"
import type { PumpConfig } from "@/types/pump"
import type { IngredientLevel } from "@/types/ingredient-level"
import CocktailCard from "@/components/cocktail-card"
import ServiceMenu from "@/components/service-menu"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Home() {
  const [cocktails, setCocktails] = useState<Cocktail[]>([])
  const [pumpConfig, setPumpConfig] = useState<PumpConfig[]>([])
  const [ingredientLevels, setIngredientLevels] = useState<IngredientLevel[]>([])
  const [selectedCocktail, setSelectedCocktail] = useState<Cocktail | null>(null)
  const [selectedSize, setSelectedSize] = useState<number>(300)
  const [isMaking, setIsMaking] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showServiceMenu, setShowServiceMenu] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadCocktails(), loadPumpConfig(), loadIngredientLevels()])
    } catch (error) {
      console.error("Fehler beim Laden der Daten:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCocktails = async () => {
    try {
      const response = await fetch("/api/cocktails")
      if (!response.ok) throw new Error("Failed to load cocktails")
      const data = await response.json()
      setCocktails(data)
    } catch (error) {
      console.error("Fehler beim Laden der Cocktails:", error)
    }
  }

  const loadPumpConfig = async () => {
    try {
      const response = await fetch("/api/pump-config")
      if (!response.ok) throw new Error("Failed to load pump config")
      const data = await response.json()
      setPumpConfig(data)
    } catch (error) {
      console.error("Fehler beim Laden der Pumpenkonfiguration:", error)
    }
  }

  const loadIngredientLevels = async () => {
    try {
      const response = await fetch("/api/ingredient-levels")
      if (!response.ok) throw new Error("Failed to load ingredient levels")
      const data = await response.json()
      setIngredientLevels(data)
    } catch (error) {
      console.error("Fehler beim Laden der Füllstände:", error)
    }
  }

  const handleCocktailSelect = (cocktail: Cocktail) => {
    setSelectedCocktail(cocktail)
    // Setze die erste verfügbare Größe als Standard
    if (cocktail.sizes && cocktail.sizes.length > 0) {
      setSelectedSize(cocktail.sizes[0])
    } else {
      setSelectedSize(300) // Fallback
    }
  }

  const handleCancelSelection = () => {
    setSelectedCocktail(null)
  }

  const handleMakeCocktail = async () => {
    if (!selectedCocktail) return

    setIsMaking(true)
    setProgress(0)
    setStatusMessage("Bereite Cocktail vor...")
    setErrorMessage(null)

    let intervalId: NodeJS.Timeout

    try {
      intervalId = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalId)
            return 100
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/make-cocktail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cocktail: selectedCocktail, size: selectedSize }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to make cocktail")
      }

      clearInterval(intervalId)
      setProgress(100)
      setStatusMessage(`${selectedCocktail.name} (${selectedSize}ml) fertig!`)
      setShowSuccess(true)

      // Lade die Füllstände neu
      await loadIngredientLevels()

      setTimeout(() => {
        setIsMaking(false)
        setShowSuccess(false)
        setSelectedCocktail(null)
      }, 3000)
    } catch (error) {
      clearInterval(intervalId)
      setProgress(0)
      setStatusMessage("Fehler bei der Zubereitung!")
      setErrorMessage(error instanceof Error ? error.message : "Unbekannter Fehler")
      setTimeout(() => setIsMaking(false), 3000)
    }
  }

  const handleServiceMenuClose = async () => {
    setShowServiceMenu(false)
    // Lade alle Daten neu, wenn das Servicemenü geschlossen wird
    await loadData()
  }

  const handleNewCocktail = (newCocktail: Cocktail) => {
    setCocktails((prev) => [...prev, newCocktail])
  }

  const checkIngredientsAvailable = (cocktail: Cocktail) => {
    if (!ingredientLevels || ingredientLevels.length === 0) return false

    return cocktail.recipe.every((item) => {
      if (item.type === "manual") return true
      const level = ingredientLevels.find((level) => level.ingredientId === item.ingredientId)
      return level && level.currentAmount >= item.amount
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--cocktail-primary))] mx-auto mb-4" />
          <p className="text-white text-lg">Lade CocktailBot...</p>
        </div>
      </div>
    )
  }

  if (showServiceMenu) {
    return (
      <ServiceMenu
        onClose={handleServiceMenuClose}
        pumpConfig={pumpConfig}
        ingredientLevels={ingredientLevels}
        onNewCocktail={handleNewCocktail}
      />
    )
  }

  if (isMaking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-[hsl(var(--cocktail-card-border))] bg-black text-[hsl(var(--cocktail-text))]">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-xl font-semibold text-center">{statusMessage}</h2>
            <Progress value={progress} className="h-2" />

            {errorMessage && (
              <Alert className="bg-[hsl(var(--cocktail-error))]/10 border-[hsl(var(--cocktail-error))]/30">
                <AlertCircle className="h-4 w-4 text-[hsl(var(--cocktail-error))]" />
                <AlertDescription className="text-[hsl(var(--cocktail-error))]">{errorMessage}</AlertDescription>
              </Alert>
            )}

            {showSuccess && (
              <div className="flex justify-center">
                <div className="rounded-full bg-[hsl(var(--cocktail-success))]/20 p-3">
                  <Check className="h-8 w-8 text-[hsl(var(--cocktail-success))]" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedCocktail) {
    const isAvailable = checkIngredientsAvailable(selectedCocktail)
    const availableSizes = selectedCocktail.sizes || [200, 300, 400]

    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-md mx-auto space-y-4">
          <Card className="border-[hsl(var(--cocktail-card-border))] bg-black">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-[hsl(var(--cocktail-text))]">{selectedCocktail.name}</CardTitle>
              {selectedCocktail.description && (
                <p className="text-[hsl(var(--cocktail-text-muted))]">{selectedCocktail.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-[hsl(var(--cocktail-card-bg))]">
                <img
                  src={selectedCocktail.image || "/placeholder.svg"}
                  alt={selectedCocktail.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=200&width=400"
                  }}
                />
              </div>

              <div>
                <h4 className="text-lg mb-2 text-center text-[hsl(var(--cocktail-text))]">Größe wählen:</h4>
                <div className="flex gap-2 justify-center">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded bg-[hsl(var(--cocktail-card-bg))] ${
                        selectedSize === size
                          ? "font-semibold border-2 border-[hsl(var(--cocktail-primary))] text-[hsl(var(--cocktail-primary))]"
                          : "text-[hsl(var(--cocktail-text))] hover:text-[hsl(var(--cocktail-primary))]"
                      }`}
                    >
                      {size}ml
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelSelection}
                  className="flex-1 bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border))]"
                >
                  Zurück
                </Button>
                <Button
                  onClick={handleMakeCocktail}
                  disabled={!isAvailable}
                  className="flex-1 bg-[hsl(var(--cocktail-primary))] hover:bg-[hsl(var(--cocktail-primary-hover))] text-black"
                >
                  Zubereiten
                </Button>
              </div>

              {!isAvailable && (
                <Alert className="bg-[hsl(var(--cocktail-warning))]/10 border-[hsl(var(--cocktail-warning))]/30">
                  <AlertCircle className="h-4 w-4 text-[hsl(var(--cocktail-warning))]" />
                  <AlertDescription className="text-[hsl(var(--cocktail-warning))]">
                    Nicht alle Zutaten sind in ausreichender Menge vorhanden.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[hsl(var(--cocktail-text))]">CocktailBot</h1>
          <Button
            onClick={() => setShowServiceMenu(true)}
            className="bg-[hsl(var(--cocktail-primary))] hover:bg-[hsl(var(--cocktail-primary-hover))] text-black"
          >
            Service
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cocktails.map((cocktail) => (
            <CocktailCard
              key={cocktail.id}
              cocktail={cocktail}
              onClick={() => handleCocktailSelect(cocktail)}
              isAvailable={checkIngredientsAvailable(cocktail)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
