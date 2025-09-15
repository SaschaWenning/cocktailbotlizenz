"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw } from "lucide-react"
import { VirtualKeyboard } from "@/components/virtual-keyboard"
import { pumpConfig } from "@/data/pump-config"
import {
  getIngredientLevels,
  updateIngredientLevel,
  updateContainerSize,
  updateIngredientName,
  resetAllLevels,
  onIngredientLevelsUpdated,
  type IngredientLevel,
} from "@/lib/ingredient-level-service"

export function IngredientLevels() {
  const [levels, setLevels] = useState<IngredientLevel[]>([])
  const [editingLevel, setEditingLevel] = useState<number | null>(null)
  const [editingSize, setEditingSize] = useState<number | null>(null)
  const [editingName, setEditingName] = useState<number | null>(null)
  const [tempValue, setTempValue] = useState("")
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadLevels()
    const unsubscribe = onIngredientLevelsUpdated(loadLevels)

    const interval = setInterval(loadLevels, 10000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const loadLevels = async () => {
    try {
      const response = await fetch("/api/ingredient-levels")
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.levels) {
          setLevels(data.levels)
          return
        }
      }
    } catch (error) {
      console.error("Failed to load levels from server:", error)
    }

    // Fallback to localStorage
    const currentLevels = getIngredientLevels()
    setLevels(currentLevels)
  }

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await loadLevels()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const getIngredientDisplayName = (ingredientId: string) => {
    const pump = pumpConfig.find((p) => p.ingredient === ingredientId)
    if (!pump) return ingredientId

    // Convert ingredient ID to display name
    return ingredientId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const handleLevelEdit = (pumpId: number) => {
    const level = levels.find((l) => l.pumpId === pumpId)
    if (level) {
      setTempValue(level.currentLevel.toString())
      setEditingLevel(pumpId)
      setShowKeyboard(true)
    }
  }

  const handleSizeEdit = (pumpId: number) => {
    const level = levels.find((l) => l.pumpId === pumpId)
    if (level) {
      setTempValue(level.containerSize.toString())
      setEditingSize(pumpId)
      setShowKeyboard(true)
    }
  }

  const handleNameEdit = (pumpId: number) => {
    const level = levels.find((l) => l.pumpId === pumpId)
    if (level) {
      setTempValue(level.ingredient)
      setEditingName(pumpId)
      setShowKeyboard(true)
    }
  }

  const handleSave = async () => {
    try {
      if (editingLevel) {
        const newLevel = Number.parseInt(tempValue) || 0
        await updateIngredientLevel(editingLevel, newLevel)
      } else if (editingSize) {
        const newSize = Number.parseInt(tempValue) || 100
        await updateContainerSize(editingSize, newSize)
      } else if (editingName) {
        await updateIngredientName(editingName, tempValue)
      }

      await loadLevels() // Reload to show changes
      handleCancel()
    } catch (error) {
      console.error("Error saving:", error)
    }
  }

  const handleCancel = () => {
    setEditingLevel(null)
    setEditingSize(null)
    setEditingName(null)
    setTempValue("")
    setShowKeyboard(false)
  }

  const handleResetAll = async () => {
    try {
      await resetAllLevels()
      await loadLevels()
    } catch (error) {
      console.error("Error resetting levels:", error)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage > 50) return "bg-[hsl(var(--cocktail-primary))]"
    if (percentage > 20) return "bg-[hsl(var(--cocktail-warning))]"
    return "bg-[hsl(var(--cocktail-error))]"
  }

  const enabledLevels = levels.filter((level) => {
    const pump = pumpConfig.find((p) => p.id === level.pumpId)
    return pump?.enabled !== false
  })

  return (
    <div className="min-h-screen bg-[hsl(var(--cocktail-bg))] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-[hsl(var(--cocktail-text))]">Füllstände</h1>
          <div className="flex gap-3">
            <Button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="bg-[hsl(var(--cocktail-card-bg))] hover:bg-[hsl(var(--cocktail-card-border))] text-[hsl(var(--cocktail-text))] border border-[hsl(var(--cocktail-card-border))] px-6 py-3 rounded-xl font-semibold"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Aktualisieren
            </Button>
            <Button
              onClick={handleResetAll}
              className="bg-[hsl(var(--cocktail-error))] hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Alle zurücksetzen
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {enabledLevels.map((level) => {
            const percentage = (level.currentLevel / level.containerSize) * 100
            const displayName = getIngredientDisplayName(level.ingredient)

            return (
              <Card
                key={level.pumpId}
                className="bg-[hsl(var(--cocktail-card-bg))] border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))] transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-[hsl(var(--cocktail-text))] font-bold flex justify-between items-center">
                    <span className="truncate">{displayName}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleNameEdit(level.pumpId)}
                      className="text-[hsl(var(--cocktail-text))] hover:bg-[hsl(var(--cocktail-card-border))] p-2"
                    >
                      ✏️
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-[hsl(var(--cocktail-text-muted))]">
                      <span>Füllstand:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLevelEdit(level.pumpId)}
                        className="h-6 px-2 text-[hsl(var(--cocktail-text))] hover:bg-[hsl(var(--cocktail-card-border))]"
                      >
                        {level.currentLevel}ml ✏️
                      </Button>
                    </div>
                    <div className="bg-[hsl(var(--cocktail-card-border))] rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${getProgressColor(percentage)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-center text-sm text-[hsl(var(--cocktail-text-muted))]">
                      {percentage.toFixed(0)}%
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-[hsl(var(--cocktail-text-muted))]">
                    <span>Behältergröße:</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSizeEdit(level.pumpId)}
                      className="h-6 px-2 text-[hsl(var(--cocktail-text))] hover:bg-[hsl(var(--cocktail-card-border))]"
                    >
                      {level.containerSize}ml ✏️
                    </Button>
                  </div>

                  <div className="text-xs text-[hsl(var(--cocktail-text-muted))] text-center">
                    Aktualisiert: {new Date(level.lastUpdated).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {showKeyboard && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[hsl(var(--cocktail-card-bg))] border border-[hsl(var(--cocktail-card-border))] rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              <div className="bg-[hsl(var(--cocktail-primary))] p-6">
                <h3 className="text-xl font-bold text-black">
                  {editingLevel && "Füllstand bearbeiten"}
                  {editingSize && "Behältergröße bearbeiten"}
                  {editingName && "Zutat bearbeiten"}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <Input
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="text-lg text-center font-semibold border-2 focus:border-[hsl(var(--cocktail-primary))] bg-[hsl(var(--cocktail-bg))] text-[hsl(var(--cocktail-text))]"
                  readOnly
                />

                <VirtualKeyboard
                  onKeyPress={(key) => {
                    if (key === "Backspace") {
                      setTempValue((prev) => prev.slice(0, -1))
                    } else if (key === "Clear") {
                      setTempValue("")
                    } else if (editingName || (!editingName && /^\d$/.test(key))) {
                      setTempValue((prev) => prev + key)
                    }
                  }}
                  showNumbers={!editingName}
                  showLetters={!!editingName}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-[hsl(var(--cocktail-primary))] hover:bg-[hsl(var(--cocktail-primary-hover))] text-black font-semibold py-3 rounded-xl"
                  >
                    Speichern
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 border-2 border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))] font-semibold py-3 rounded-xl bg-transparent text-[hsl(var(--cocktail-text))]"
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IngredientLevels
