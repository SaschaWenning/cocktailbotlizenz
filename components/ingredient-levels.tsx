"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { VirtualKeyboard } from "@/components/virtual-keyboard"
import {
  getIngredientLevels,
  updateIngredientLevel,
  updateContainerSize,
  updateIngredientName,
  resetAllLevels,
  type IngredientLevel,
} from "@/lib/ingredient-level-service"

export function IngredientLevels() {
  const [levels, setLevels] = useState<IngredientLevel[]>([])
  const [editingLevel, setEditingLevel] = useState<number | null>(null)
  const [editingSize, setEditingSize] = useState<number | null>(null)
  const [editingName, setEditingName] = useState<number | null>(null)
  const [tempValue, setTempValue] = useState("")
  const [showKeyboard, setShowKeyboard] = useState(false)

  // Load levels on component mount
  useEffect(() => {
    loadLevels()
  }, [])

  const loadLevels = () => {
    const currentLevels = getIngredientLevels()
    setLevels(currentLevels)
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

      loadLevels() // Reload to show changes
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
      loadLevels()
    } catch (error) {
      console.error("Error resetting levels:", error)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage > 50) return "bg-green-500"
    if (percentage > 20) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Füllstände</h2>
        <Button onClick={handleResetAll} variant="outline">
          Alle zurücksetzen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map((level) => {
          const percentage = (level.currentLevel / level.containerSize) * 100

          return (
            <Card key={level.pumpId} className="p-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Pumpe {level.pumpId}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleNameEdit(level.pumpId)}>
                    ✏️
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm font-medium">{level.ingredient}</div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Füllstand:</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLevelEdit(level.pumpId)}
                      className="h-6 px-2"
                    >
                      {level.currentLevel}ml ✏️
                    </Button>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>

                <div className="flex justify-between text-sm">
                  <span>Behältergröße:</span>
                  <Button size="sm" variant="ghost" onClick={() => handleSizeEdit(level.pumpId)} className="h-6 px-2">
                    {level.containerSize}ml ✏️
                  </Button>
                </div>

                <div className="text-xs text-gray-500">
                  Aktualisiert: {new Date(level.lastUpdated).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {showKeyboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">
              {editingLevel && "Füllstand bearbeiten"}
              {editingSize && "Behältergröße bearbeiten"}
              {editingName && "Zutat bearbeiten"}
            </h3>

            <Input value={tempValue} onChange={(e) => setTempValue(e.target.value)} className="mb-4" readOnly />

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

            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} className="flex-1">
                Speichern
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1 bg-transparent">
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IngredientLevels
