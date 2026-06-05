"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Wind, Play, Settings } from "lucide-react"
import type { PumpConfig, VentingConfig } from "@/types/pump"
import { cleanPump } from "@/lib/cocktail-machine"
import { getAllIngredients } from "@/lib/ingredients"

interface PumpVentingProps {
  pumpConfig: PumpConfig[]
}

export default function PumpVenting({ pumpConfig }: PumpVentingProps) {
  const [autoVentingStatus, setAutoVentingStatus] = useState<"idle" | "venting">("idle")
  const [currentPump, setCurrentPump] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [pumpsDone, setPumpsDone] = useState<number[]>([])
  const [manualVentingPumps, setManualVentingPumps] = useState<Set<number>>(new Set())
  const [ventingConfig, setVentingConfig] = useState<VentingConfig>({})
  const [editingConfig, setEditingConfig] = useState<VentingConfig>({})
  const [showSettings, setShowSettings] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  const enabledPumps = pumpConfig.filter((pump) => pump.enabled)

  // Lade Entlüftungs-Konfiguration beim Start
  useEffect(() => {
    loadVentingConfig()
  }, [])

  // Lade Konfiguration von API
  const loadVentingConfig = async () => {
    try {
      const response = await fetch("/api/venting-config")
      const config: VentingConfig = await response.json()
      setVentingConfig(config)
      setEditingConfig(config)
    } catch (error) {
      console.error("Error loading venting config:", error)
      // Setze Standard-Zeiten
      const defaultConfig: VentingConfig = {}
      enabledPumps.forEach((pump) => {
        defaultConfig[pump.id] = 2000
      })
      setVentingConfig(defaultConfig)
      setEditingConfig(defaultConfig)
    }
  }

  // Speichere Entlüftungs-Konfiguration
  const saveVentingConfig = async () => {
    setSaveStatus("saving")
    try {
      const response = await fetch("/api/venting-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingConfig),
      })

      if (!response.ok) {
        throw new Error("Failed to save configuration")
      }

      setVentingConfig(editingConfig)
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
      setShowSettings(false)
    } catch (error) {
      console.error("Error saving venting config:", error)
      setSaveStatus("idle")
      alert("Fehler beim Speichern der Konfiguration")
    }
  }

  // Automatische Entlüftung aller Pumpen mit gespeicherten Zeiten
  const startAutoVenting = async () => {
    setAutoVentingStatus("venting")
    setProgress(0)
    setPumpsDone([])
    setCurrentPump(null)

    // Jede Pumpe nacheinander mit der konfigurierten Zeit entlüften
    for (let i = 0; i < enabledPumps.length; i++) {
      const pump = enabledPumps[i]
      setCurrentPump(pump.id)
      const duration = ventingConfig[pump.id] || 2000

      try {
        await cleanPump(pump.id, duration)
        setPumpsDone((prev) => [...prev, pump.id])

        // Fortschritt aktualisieren
        setProgress(Math.round(((i + 1) / enabledPumps.length) * 100))
      } catch (error) {
        console.error(`Fehler beim Entlüften der Pumpe ${pump.id}:`, error)
      }
    }

    setCurrentPump(null)
    setAutoVentingStatus("idle")
  }

  // Einzelne Pumpe entlüften (1 Sekunde, ohne Ladebildschirm)
  const ventSinglePump = async (pumpId: number) => {
    setManualVentingPumps((prev) => new Set(prev).add(pumpId))

    try {
      await cleanPump(pumpId, 1000) // 1 Sekunde
    } catch (error) {
      console.error(`Fehler beim Entlüften der Pumpe ${pumpId}:`, error)
    } finally {
      // Kurze Verzögerung für visuelle Rückmeldung
      setTimeout(() => {
        setManualVentingPumps((prev) => {
          const newSet = new Set(prev)
          newSet.delete(pumpId)
          return newSet
        })
      }, 100)
    }
  }

  const resetAutoVenting = () => {
    setAutoVentingStatus("idle")
    setCurrentPump(null)
    setProgress(0)
    setPumpsDone([])
  }

  const getIngredientDisplayName = (ingredientId: string): string => {
    if (!ingredientId) return ""

    const allIngredients = getAllIngredients()
    const ingredient = allIngredients.find((i) => i.id === ingredientId)

    if (ingredient) {
      return ingredient.name
    }

    // If it's a custom ingredient, extract the name from the ID
    if (ingredientId.startsWith("custom-")) {
      const extractedName = ingredientId.replace(/^custom-\d+-/, "").trim()
      return extractedName || ingredientId
    }

    return ingredientId
  }

  return (
    <div className="space-y-4">
      {/* Einstellungen für Entlüftungszeiten */}
      {showSettings && (
        <Card className="bg-black border-[hsl(var(--cocktail-card-border))]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5 text-[hsl(var(--cocktail-primary))]" />
              Entlüftungszeiten einstellen
            </CardTitle>
            <CardDescription className="text-[hsl(var(--cocktail-text-muted))]">
              Stelle die Entlüftungszeit für jede Pumpe ein (100-10000 ms)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-[hsl(var(--cocktail-card-bg))] border-[hsl(var(--cocktail-card-border))]">
              <AlertDescription className="text-[hsl(var(--cocktail-text))] text-sm">
                Die hier eingestellten Zeiten werden bei der automatischen Entlüftung verwendet.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {enabledPumps.map((pump) => (
                <div key={pump.id} className="space-y-2">
                  <div className="flex flex-col">
                    <Label className="text-[hsl(var(--cocktail-text))] text-sm font-medium">
                      Pumpe {pump.id}
                    </Label>
                    <span className="text-xs text-[hsl(var(--cocktail-text-muted))]">
                      {getIngredientDisplayName(pump.ingredient)}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={editingConfig[pump.id] || 2000}
                    onChange={(e) =>
                      setEditingConfig({
                        ...editingConfig,
                        [pump.id]: parseInt(e.target.value, 10),
                      })
                    }
                    className="bg-[hsl(var(--cocktail-bg))] border-[hsl(var(--cocktail-card-border))] text-[hsl(var(--cocktail-text))]"
                  />
                  <span className="text-xs text-[hsl(var(--cocktail-text-muted))]">
                    {editingConfig[pump.id] || 2000} ms
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={saveVentingConfig}
                disabled={saveStatus === "saving"}
                className="flex-1 bg-[hsl(var(--cocktail-primary))] hover:bg-[hsl(var(--cocktail-primary-hover))] text-black"
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : saveStatus === "saved" ? (
                  "✓ Gespeichert"
                ) : (
                  "Speichern"
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowSettings(false)
                  setEditingConfig(ventingConfig)
                }}
                className="flex-1 bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border))]"
              >
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automatische Entlüftung */}
      <Card className="bg-black border-[hsl(var(--cocktail-card-border))]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Wind className="h-5 w-5 text-[hsl(var(--cocktail-primary))]" />
              Automatische Entlüftung
            </CardTitle>
            <Button
              onClick={() => setShowSettings(!showSettings)}
              size="sm"
              className="bg-[hsl(var(--cocktail-card-bg))] hover:bg-[hsl(var(--cocktail-primary))]/20 text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border))]"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-[hsl(var(--cocktail-text-muted))]">
            Entlüfte alle Pumpen nacheinander mit individualisierten Zeiten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="bg-[hsl(var(--cocktail-card-bg))] border-[hsl(var(--cocktail-card-border))]">
            <AlertDescription className="text-[hsl(var(--cocktail-text))] text-sm">
              <p className="font-medium mb-1">Vorbereitung:</p>
              <p>
                Stelle einen Auffangbehälter unter die Ausgänge und sorge dafür, dass alle Ansaugschläuche in den
                entsprechenden Flüssigkeiten liegen.
              </p>
            </AlertDescription>
          </Alert>

          {autoVentingStatus === "idle" && (
            <Button
              onClick={startAutoVenting}
              className="w-full bg-[hsl(var(--cocktail-primary))] hover:bg-[hsl(var(--cocktail-primary-hover))] text-black"
              size="lg"
            >
              <Wind className="mr-2 h-5 w-5" />
              Automatische Entlüftung starten
            </Button>
          )}

          {autoVentingStatus === "venting" && (
            <div className="space-y-3">
              <Progress value={progress} className="h-2" indicatorClassName="bg-[hsl(var(--cocktail-primary))]" />

              <div className="flex justify-between items-center">
                <span className="text-sm text-[hsl(var(--cocktail-text-muted))]">
                  {pumpsDone.length} von {enabledPumps.length} Pumpen entlüftet
                </span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>

              {currentPump !== null && (
                <Alert className="bg-[hsl(var(--cocktail-card-bg))] border-[hsl(var(--cocktail-card-border))]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--cocktail-primary))]" />
                    <AlertDescription className="text-[hsl(var(--cocktail-text))]">
                      Entlüfte Pumpe {currentPump}...
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <div className="grid grid-cols-5 gap-2">
                {enabledPumps.map((pump) => (
                  <div
                    key={pump.id}
                    className={`p-2 rounded-md text-center ${
                      pumpsDone.includes(pump.id)
                        ? "bg-[hsl(var(--cocktail-success))]/10 border border-[hsl(var(--cocktail-success))]/30"
                        : currentPump === pump.id
                          ? "bg-[hsl(var(--cocktail-primary))]/20 border border-[hsl(var(--cocktail-primary))]/50 font-bold animate-pulse"
                          : "bg-[hsl(var(--cocktail-bg))] border border-[hsl(var(--cocktail-card-border)))"
                    }`}
                  >
                    <span className={`text-sm ${currentPump === pump.id ? "text-white font-bold" : ""}`}>
                      {pump.id}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={resetAutoVenting}
                className="w-full bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border)))]"
              >
                Abbrechen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manuelle Einzelpumpen-Entlüftung */}
      <Card className="bg-black border-[hsl(var(--cocktail-card-border))]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-white">
            <Play className="h-5 w-5 text-[hsl(var(--cocktail-primary))]" />
            Manuelle Entlüftung
          </CardTitle>
          <CardDescription className="text-[hsl(var(--cocktail-text-muted))]">
            Entlüfte einzelne Pumpen mit 1 Sekunde
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="bg-[hsl(var(--cocktail-card-bg))] border-[hsl(var(--cocktail-card-border))]">
            <AlertDescription className="text-[hsl(var(--cocktail-text))] text-sm">
              Klicke auf eine Pumpe um sie zu entlüften. Die Pumpe startet sofort ohne Ladebildschirm.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-5 gap-3">
            {enabledPumps.map((pump) => (
              <div key={pump.id} className="flex flex-col items-center space-y-2">
                <Button
                  onClick={() => ventSinglePump(pump.id)}
                  disabled={autoVentingStatus === "venting"}
                  className={`w-full h-16 text-2xl font-bold ${
                    manualVentingPumps.has(pump.id)
                      ? "bg-[hsl(var(--cocktail-primary))]/30 border border-[hsl(var(--cocktail-primary))]/50"
                      : "bg-[hsl(var(--cocktail-card-bg))] hover:bg-[hsl(var(--cocktail-primary))] hover:text-black"
                  } text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border))]`}
                >
                  {pump.id}
                </Button>
                {pump.ingredient && (
                  <span className="text-xs text-[hsl(var(--cocktail-text-muted))] text-center">
                    {getIngredientDisplayName(pump.ingredient)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
