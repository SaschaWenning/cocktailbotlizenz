"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

  useEffect(() => {
    loadLevels()
    const unsubscribe = onIngredientLevelsUpdated(loadLevels)

    // Auto-refresh every 5 seconds to catch server updates
    const interval = setInterval(loadLevels, 5000)

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
    if (percentage > 50) return "bg-green-500"
    if (percentage > 20) return "bg-yellow-500"
    return "bg-red-500"
  }

  const enabledLevels = levels.filter((level) => {
    const pump = pumpConfig.find((p) => p.id === level.pumpId)
    return pump?.enabled !== false
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white">Füllstände</h1>
          <Button
            onClick={handleResetAll}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Alle zurücksetzen
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {enabledLevels.map((level) => {
            const percentage = (level.currentLevel / level.containerSize) * 100
            const displayName = getIngredientDisplayName(level.ingredient)

            return (
              <Card
                key={level.pumpId}
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-white font-bold flex justify-between items-center">
                    <span className="truncate">{displayName}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleNameEdit(level.pumpId)}
                      className="text-white hover:bg-white/20 p-2"
                    >
                      ✏️
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Füllstand:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLevelEdit(level.pumpId)}
                        className="h-6 px-2 text-white hover:bg-white/20"
                      >
                        {level.currentLevel}ml ✏️
                      </Button>
                    </div>
                    <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${getProgressColor(percentage)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-center text-sm text-white/60">{percentage.toFixed(0)}%</div>
                  </div>

                  <div className="flex justify-between text-sm text-white/80">
                    <span>Behältergröße:</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSizeEdit(level.pumpId)}
                      className="h-6 px-2 text-white hover:bg-white/20"
                    >
                      {level.containerSize}ml ✏️
                    </Button>
                  </div>

                  <div className="text-xs text-white/40 text-center">
                    Aktualisiert: {new Date(level.lastUpdated).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {showKeyboard && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
                <h3 className="text-xl font-bold text-white">
                  {editingLevel && "Füllstand bearbeiten"}
                  {editingSize && "Behältergröße bearbeiten"}
                  {editingName && "Zutat bearbeiten"}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <Input
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="text-lg text-center font-semibold border-2 focus:border-purple-500"
                  readOnly
                />

                <VirtualKeyboard
                  onKeyPress={(key) => {
                    if (key === "Backspace") {
                      setTempValue((prev) => prev.slice(0, -1))
                    } else if (key === "Clear") {
                      setTempValue("")
                    } else if (editingName || (!editingName && /^\\d$/.test(key))) {
                      setTempValue((prev) => prev + key)
                    }
                  }}
                  showNumbers={!editingName}
                  showLetters={!!editingName}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl"
                  >
                    Speichern
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 hover:bg-gray-100 font-semibold py-3 rounded-xl bg-transparent"
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
