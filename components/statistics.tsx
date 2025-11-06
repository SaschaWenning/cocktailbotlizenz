"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RotateCcw, Euro } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Cocktail } from "@/types/cocktail"
import type { PumpConfig } from "@/types/pump"
import { getAllIngredients } from "@/lib/ingredients"

interface CocktailStat {
  cocktailId: string
  cocktailName: string
  count: number
}

interface IngredientPrice {
  ingredientId: string
  ingredientName: string
  pricePerLiter: number
}

interface Statistics {
  cocktails: CocktailStat[]
  ingredientPrices: IngredientPrice[]
  lastUpdated: string
}

interface StatisticsProps {
  cocktails: Cocktail[]
  pumpConfig: PumpConfig[]
}

export default function Statistics({ cocktails, pumpConfig }: StatisticsProps) {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null)
  const [editingIngredientName, setEditingIngredientName] = useState<string>("")
  const [priceInput, setPriceInput] = useState("")

  const STORAGE_KEY = "cocktail_statistics"

  const getIngredientName = (ingredientId: string): string => {
    const allIngredients = getAllIngredients()
    const ingredient = allIngredients.find((i) => i.id === ingredientId)
    return ingredient ? ingredient.name : ingredientId
  }

  const getIngredientList = () => {
    return pumpConfig
      .filter((pump) => pump.enabled)
      .map((pump) => ({
        ingredientId: pump.ingredient,
        ingredientName: getIngredientName(pump.ingredient),
      }))
  }

  const loadStatistics = () => {
    try {
      setLoading(true)
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data: Statistics = JSON.parse(stored)
        setStatistics(data)
      } else {
        const emptyStats: Statistics = {
          cocktails: [],
          ingredientPrices: [],
          lastUpdated: new Date().toISOString(),
        }
        setStatistics(emptyStats)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyStats))
      }
      console.log("[v0] Statistics loaded successfully")
    } catch (error) {
      console.error("[v0] Error loading statistics:", error)
      const emptyStats: Statistics = {
        cocktails: [],
        ingredientPrices: [],
        lastUpdated: new Date().toISOString(),
      }
      setStatistics(emptyStats)
    } finally {
      setLoading(false)
    }
  }

  const saveStatistics = (stats: Statistics) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
      console.log("[v0] Statistics saved successfully")
    } catch (error) {
      console.error("[v0] Error saving statistics:", error)
    }
  }

  useEffect(() => {
    loadStatistics()
  }, [])

  const handleResetStatistics = () => {
    if (!statistics) return

    try {
      const newStats: Statistics = {
        cocktails: [],
        ingredientPrices: statistics.ingredientPrices,
        lastUpdated: new Date().toISOString(),
      }
      saveStatistics(newStats)
      setStatistics(newStats)
      setShowResetConfirm(false)
    } catch (error) {
      console.error("[v0] Error resetting statistics:", error)
    }
  }

  const handleKeyPress = (key: string) => {
    if (key === ",") {
      if (!priceInput.includes(",")) {
        setPriceInput((prev) => prev + key)
      }
    } else if (/^\d$/.test(key)) {
      setPriceInput((prev) => prev + key)
    }
  }

  const handleBackspace = () => {
    setPriceInput((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    setPriceInput("")
  }

  const handleSavePrice = () => {
    if (!statistics || !editingIngredientId || !priceInput) return

    try {
      const price = Number.parseFloat(priceInput.replace(",", "."))
      if (isNaN(price) || price < 0) return

      const updatedStats = { ...statistics }
      const existingPrice = updatedStats.ingredientPrices.find((p) => p.ingredientId === editingIngredientId)

      if (existingPrice) {
        existingPrice.pricePerLiter = price
      } else {
        updatedStats.ingredientPrices.push({
          ingredientId: editingIngredientId,
          ingredientName: editingIngredientName,
          pricePerLiter: price,
        })
      }

      updatedStats.lastUpdated = new Date().toISOString()
      saveStatistics(updatedStats)
      setStatistics(updatedStats)

      setEditingIngredientId(null)
      setPriceInput("")
    } catch (error) {
      console.error("[v0] Error saving price:", error)
    }
  }

  const handleOpenPriceInput = (ingredientId: string, ingredientName: string) => {
    const existingPrice = statistics?.ingredientPrices.find((p) => p.ingredientId === ingredientId)
    setEditingIngredientId(ingredientId)
    setEditingIngredientName(ingredientName)
    setPriceInput(existingPrice ? existingPrice.pricePerLiter.toString().replace(".", ",") : "0,00")
    console.log("[v0] Opening price input for:", ingredientId, ingredientName)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[hsl(var(--cocktail-text-muted))]">Lade Statistiken...</div>
      </div>
    )
  }

  if (!statistics) {
    return <div className="text-center text-[hsl(var(--cocktail-text-muted))]">Keine Statistiken verfügbar</div>
  }

  const allIngredients = getIngredientList()
  const sortedCocktails = [...statistics.cocktails].sort((a, b) => b.count - a.count)
  const totalCost = allIngredients.reduce((sum, ing) => {
    const price = statistics.ingredientPrices.find((p) => p.ingredientId === ing.ingredientId)
    return sum + (price ? 1 * price.pricePerLiter : 0)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[hsl(var(--cocktail-text))]">Statistiken</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowPriceModal(true)}
            className="bg-[hsl(var(--cocktail-primary))] hover:bg-[hsl(var(--cocktail-primary))]/90 text-black"
          >
            <Euro className="h-4 w-4 mr-2" />€ Preise eingeben
          </Button>
          <Button
            onClick={() => setShowResetConfirm(true)}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Zurücksetzen
          </Button>
        </div>
      </div>

      {/* Cocktail-Statistiken */}
      <Card className="bg-black border-[hsl(var(--cocktail-card-border))]">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--cocktail-text))]">
            Cocktails zubereitet ({sortedCocktails.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedCocktails.length === 0 ? (
            <p className="text-[hsl(var(--cocktail-text-muted))]">Noch keine Cocktails zubereitet</p>
          ) : (
            <div className="space-y-2">
              {sortedCocktails.map((cocktail, index) => (
                <div
                  key={cocktail.cocktailId}
                  className="flex justify-between items-center p-3 rounded-lg bg-[hsl(var(--cocktail-card-bg))] border border-[hsl(var(--cocktail-card-border))]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[hsl(var(--cocktail-primary))] font-bold">{index + 1}.</span>
                    <span className="text-[hsl(var(--cocktail-text))]">{cocktail.cocktailName}</span>
                  </div>
                  <span className="text-[hsl(var(--cocktail-primary))] font-bold text-lg">{cocktail.count}x</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zutaten-Statistiken */}
      <Card className="bg-black border-[hsl(var(--cocktail-card-border))]">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--cocktail-text))]">Zutatenverbrauch</CardTitle>
        </CardHeader>
        <CardContent>
          {allIngredients.length === 0 ? (
            <p className="text-[hsl(var(--cocktail-text-muted))]">Keine Zutaten konfiguriert</p>
          ) : (
            <div className="space-y-3">
              {allIngredients.map((ingredient) => {
                const price = statistics.ingredientPrices.find((p) => p.ingredientId === ingredient.ingredientId)

                return (
                  <div
                    key={ingredient.ingredientId}
                    className="p-4 rounded-lg bg-[hsl(var(--cocktail-card-bg))] border border-[hsl(var(--cocktail-card-border))]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-[hsl(var(--cocktail-text))] font-medium">{ingredient.ingredientName}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[hsl(var(--cocktail-primary))] font-bold text-lg">
                          {price ? price.pricePerLiter.toFixed(2) : "0.00"}€
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-[hsl(var(--cocktail-text-muted))]">
                      <span>0.00L verbraucht</span>
                      <span>{price?.pricePerLiter.toFixed(2) || "0.00"}€/L</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kosten-Übersicht */}
      <Card className="bg-black border-[hsl(var(--cocktail-card-border))]">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--cocktail-text))]">Kosten-Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-[hsl(var(--cocktail-text-muted))] mb-2">Gesamtkosten aller Zutaten</p>
            <p className="text-4xl font-bold text-[hsl(var(--cocktail-primary))]">{totalCost.toFixed(2)}€</p>
          </div>
        </CardContent>
      </Card>

      {/* Preiseingabe Modal - zeigt nur Zutaten an */}
      {showPriceModal && editingIngredientId === null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="bg-black border-[hsl(var(--cocktail-card-border))] max-w-md max-h-[70vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-[hsl(var(--cocktail-text))]">Zutatenpreise eingeben</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allIngredients.length === 0 ? (
                <p className="text-[hsl(var(--cocktail-text-muted))]">Keine Zutaten verfügbar</p>
              ) : (
                allIngredients.map((ingredient) => {
                  const price = statistics.ingredientPrices.find((p) => p.ingredientId === ingredient.ingredientId)
                  return (
                    <Button
                      key={ingredient.ingredientId}
                      onClick={() => handleOpenPriceInput(ingredient.ingredientId, ingredient.ingredientName)}
                      variant="outline"
                      className="w-full justify-between h-12 bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))]"
                    >
                      <span>{ingredient.ingredientName}</span>
                      <span className="text-[hsl(var(--cocktail-primary))] font-bold">
                        {price?.pricePerLiter.toFixed(2) || "0.00"}€/L
                      </span>
                    </Button>
                  )
                })
              )}
              <Button
                onClick={() => setShowPriceModal(false)}
                className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white"
              >
                Fertig
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {editingIngredientId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-[hsl(var(--cocktail-card-border))] rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-[hsl(var(--cocktail-text))] font-bold mb-2">Preis für</h3>
            <p className="text-[hsl(var(--cocktail-primary))] font-bold text-lg mb-4">{editingIngredientName}</p>

            <div className="mb-6">
              <div className="text-center p-4 rounded bg-[hsl(var(--cocktail-bg))] border border-[hsl(var(--cocktail-card-border))]">
                <input
                  type="text"
                  value={priceInput}
                  readOnly
                  className="w-full text-center text-3xl font-bold text-[hsl(var(--cocktail-primary))] bg-transparent outline-none"
                />
                <p className="text-[hsl(var(--cocktail-text-muted))] text-sm">€ pro Liter</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {/* Row 1 */}
              <div className="flex gap-1">
                {["1", "2", "3"].map((key) => (
                  <Button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className="flex-1 h-12 text-lg bg-[hsl(var(--cocktail-card-bg))] text-white hover:bg-[hsl(var(--cocktail-card-border))]"
                  >
                    {key}
                  </Button>
                ))}
              </div>
              {/* Row 2 */}
              <div className="flex gap-1">
                {["4", "5", "6"].map((key) => (
                  <Button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className="flex-1 h-12 text-lg bg-[hsl(var(--cocktail-card-bg))] text-white hover:bg-[hsl(var(--cocktail-card-border))]"
                  >
                    {key}
                  </Button>
                ))}
              </div>
              {/* Row 3 */}
              <div className="flex gap-1">
                {["7", "8", "9"].map((key) => (
                  <Button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className="flex-1 h-12 text-lg bg-[hsl(var(--cocktail-card-bg))] text-white hover:bg-[hsl(var(--cocktail-card-border))]"
                  >
                    {key}
                  </Button>
                ))}
              </div>
              {/* Row 4 - Comma, 0, Backspace */}
              <div className="flex gap-1">
                <Button
                  onClick={() => handleKeyPress(",")}
                  className="flex-1 h-12 text-lg bg-[hsl(var(--cocktail-card-bg))] text-white hover:bg-[hsl(var(--cocktail-card-border))]"
                >
                  ,
                </Button>
                <Button
                  onClick={() => handleKeyPress("0")}
                  className="flex-1 h-12 text-lg bg-[hsl(var(--cocktail-card-bg))] text-white hover:bg-[hsl(var(--cocktail-card-border))]"
                >
                  0
                </Button>
                <Button
                  onClick={handleBackspace}
                  className="flex-1 h-12 text-lg bg-red-600 text-white hover:bg-red-700"
                >
                  ←
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEditingIngredientId(null)
                  setPriceInput("")
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
              >
                Abbrechen
              </Button>
              <Button onClick={handleSavePrice} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold">
                Speichern
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Bestätigung */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="bg-black border-[hsl(var(--cocktail-card-border))] max-w-sm">
            <CardHeader>
              <CardTitle className="text-[hsl(var(--cocktail-text))]">Statistiken zurücksetzen?</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6 bg-red-600/10 border-red-600/30">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600">
                  Dies setzt alle Cocktail- und Zutatenstatistiken zurück. Die Preise bleiben erhalten.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border))]"
                >
                  Abbrechen
                </Button>
                <Button onClick={handleResetStatistics} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  Zurücksetzen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
