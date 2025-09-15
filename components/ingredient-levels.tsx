"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Bug } from "lucide-react"
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
  const [showDebug, setShowDebug] = useState(false)
  const [debugLogs, setDebugLogs] = useState<string[]>([])

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]) // Keep last 20 logs
  }

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
      addDebugLog("🔄 Loading levels from API...")
      const response = await fetch("/api/ingredient-levels")
      addDebugLog(`📡 API response status: ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        addDebugLog(`📦 API response: ${JSON.stringify(data).substring(0, 100)}...`)

        if (data.success && data.levels) {
          addDebugLog(`✅ Setting ${data.levels.length} levels from API`)
          setLevels(data.levels)
          localStorage.setItem("ingredient-levels", JSON.stringify(data.levels))
          return
        } else {
          addDebugLog(`❌ API response invalid: success=${data.success}, levels=${!!data.levels}`)
        }
      } else {
        addDebugLog(`❌ API request failed with status ${response.status}`)
      }
    } catch (error) {
      addDebugLog(`💥 API error: ${error}`)
    }

    // Fallback to localStorage
    addDebugLog("🔄 Falling back to localStorage")
    const currentLevels = getIngredientLevels()
    addDebugLog(`💾 localStorage has ${currentLevels.length} levels`)
    setLevels(currentLevels)
  }

  const handleManualRefresh = async () => {
    addDebugLog("🔄 Manual refresh triggered")
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
      addDebugLog("💾 Saving changes...")
      if (editingLevel) {
        const newLevel = Number.parseInt(tempValue) || 0
        addDebugLog(`📝 Updating level for pump ${editingLevel} to ${newLevel}ml`)
        await updateIngredientLevel(editingLevel, newLevel)
      } else if (editingSize) {
        const newSize = Number.parseInt(tempValue) || 100
        addDebugLog(`📏 Updating size for pump ${editingSize} to ${newSize}ml`)
        await updateContainerSize(editingSize, newSize)
      } else if (editingName) {
        addDebugLog(`🏷️ Updating name for pump ${editingName} to ${tempValue}`)
        await updateIngredientName(editingName, tempValue)
      }

      addDebugLog("🔄 Reloading levels after save...")
      await loadLevels() // Reload to show changes
      handleCancel()
    } catch (error) {
      addDebugLog(`💥 Save error: ${error}`)
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
      addDebugLog("🔄 Resetting all levels...")
      await resetAllLevels()
      await loadLevels()
    } catch (error) {
      addDebugLog(`💥 Reset error: ${error}`)
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
              onClick={() => setShowDebug(!showDebug)}
              className={`${showDebug ? 'bg-[hsl(var(--cocktail-primary))]' : 'bg-[hsl(var(--cocktail-card-bg))]'} hover:bg-[hsl(var(--cocktail-card-border))] text-[hsl(var(--cocktail-text))] border border-[hsl(var(--cocktail-card-border))] px-6 py-3 rounded-xl font-semibold`
            >
              <Bug className="h-4 w-4 mr-2" />
              Debug
            </Button>\
            <Button\
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

        {showDebug && (
          <Card className="bg-[hsl(var(--cocktail-card-bg))] border-[hsl(var(--cocktail-card-border))]">
            <CardHeader>
              <CardTitle className="text-[hsl(var(--cocktail-text))] flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Debug Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="font-mono text-sm space-y-1">
                  {debugLogs.length === 0 ? (
                    <div className="text-gray-500">Keine Debug-Logs verfügbar</div>
                  ) : (
                    debugLogs.map((log, index) => (
                      <div key={index} className="text-green-400">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="mt-4 text-sm text-[hsl(var(--cocktail-text-muted))]">
                Aktuelle Levels: {levels.length} | Letzte Aktualisierung: {new Date().toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        )}

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
                  layout={editingName ? "alphanumeric" : "numeric"}
                  onKeyPress={(key) => {
                    if (key === "Backspace") {
                      setTempValue((prev) => prev.slice(0, -1))
                    } else if (key === "Clear") {
                      setTempValue("")
                    } else if (editingName || (!editingName && /^[\d.]$/.test(key))) {
                      setTempValue((prev) => prev + key)
                    }
                  }}
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
