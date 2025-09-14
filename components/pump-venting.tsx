"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Loader2, Wind, Check, Settings, Play } from "lucide-react"
import type { PumpConfig } from "@/types/pump"

interface PumpVentingProps {
  pumpConfig: PumpConfig[]
}

export default function PumpVenting({ pumpConfig }: PumpVentingProps) {
  const [autoVentingStatus, setAutoVentingStatus] = useState<"idle" | "venting" | "complete">("idle")
  const [currentPump, setCurrentPump] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [pumpsDone, setPumpsDone] = useState<number[]>([])
  const [manualVentingPumps, setManualVentingPumps] = useState<Set<number>>(new Set())

  const enabledPumps = pumpConfig.filter((pump) => pump.enabled)

  const startAutoVenting = async () => {
    setAutoVentingStatus("venting")
    setProgress(0)
    setPumpsDone([])
    setCurrentPump(null)

    // Jede Pumpe nacheinander entlüften
    for (let i = 0; i < enabledPumps.length; i++) {
      const pump = enabledPumps[i]
      setCurrentPump(pump.id)

      try {
        // Pumpe für 2 Sekunden laufen lassen
        await ventPump(pump.id, 2000)
        setPumpsDone((prev) => [...prev, pump.id])
        setProgress(Math.round(((i + 1) / enabledPumps.length) * 100))
      } catch (error) {
        console.error(`Fehler beim Entlüften der Pumpe ${pump.id}:`, error)
      }
    }

    setCurrentPump(null)
    setAutoVentingStatus("complete")
  }

  const ventPump = async (pumpId: number, duration: number) => {
    try {
      const response = await fetch("/api/clean-pump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pumpId, duration }),
      })
      if (!response.ok) throw new Error("Failed to vent pump")
    } catch (error) {
      throw error
    }
  }

  const resetAutoVenting = () => {
    setAutoVentingStatus("idle")
    setCurrentPump(null)
    setProgress(0)
    setPumpsDone([])
  }

  const ventSinglePump = async (pumpId: number) => {
    try {
      await ventPump(pumpId, 1000)
      console.log(`Pumpe ${pumpId} entlüftet`)
    } catch (error) {
      console.error(`Fehler beim Entlüften der Pumpe ${pumpId}:`, error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Automatische Entlüftung */}
      <Card className="bg-black border-[hsl(var(--cocktail-card-border))]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-white">
            <Play className="h-5 w-5 text-[hsl(var(--cocktail-primary))]" />
            Automatische Entlüftung
          </CardTitle>
          <CardDescription className="text-[hsl(var(--cocktail-text-muted))]">
            Entlüfte alle Pumpen nacheinander automatisch (2 Sekunden pro Pumpe)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="bg-[hsl(var(--cocktail-card-bg))] border-[hsl(var(--cocktail-card-border))]">
            <AlertDescription className="text-[hsl(var(--cocktail-text))] text-sm">
              Die automatische Entlüftung startet alle Pumpen nacheinander für 2 Sekunden, um Luftblasen aus den
              Leitungen zu entfernen.
            </AlertDescription>
          </Alert>

          {autoVentingStatus === "idle" && (
            <Button
              onClick={startAutoVenting}
              className="w-full bg-[hsl(var(--cocktail-primary))] hover:bg-[hsl(var(--cocktail-primary-hover))] text-black"
              size="lg"
            >
              <Play className="mr-2 h-5 w-5" />
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
            </div>
          )}

          {autoVentingStatus === "complete" && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <div className="rounded-full bg-[hsl(var(--cocktail-success))]/20 p-3">
                  <Check className="h-8 w-8 text-[hsl(var(--cocktail-success))]" />
                </div>
              </div>

              <p className="text-center font-medium">Automatische Entlüftung abgeschlossen!</p>

              <Button
                onClick={resetAutoVenting}
                className="w-full bg-[hsl(var(--cocktail-card-bg))] text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border)))"
              >
                Zurücksetzen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manuelle Einzelpumpen-Entlüftung */}
      <Card className="bg-black border-[hsl(var(--cocktail-card-border))]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-[hsl(var(--cocktail-primary))]" />
            Manuelle Entlüftung
          </CardTitle>
          <CardDescription className="text-[hsl(var(--cocktail-text-muted))]">
            Entlüfte einzelne Pumpen manuell (1 Sekunde pro Pumpe)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="bg-[hsl(var(--cocktail-card-bg))] border-[hsl(var(--cocktail-card-border))]">
            <AlertDescription className="text-[hsl(var(--cocktail-text))] text-sm">
              Klicke auf eine Pumpe um sie für 1 Sekunde zu entlüften. Kein Ladebildschirm - die Pumpe startet sofort.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-5 gap-3">
            {enabledPumps.map((pump) => (
              <div key={pump.id} className="flex flex-col items-center space-y-2">
                <Button
                  onClick={() => ventSinglePump(pump.id)}
                  disabled={autoVentingStatus === "venting"}
                  className="w-full h-12 bg-[hsl(var(--cocktail-card-bg))] hover:bg-[hsl(var(--cocktail-primary))] hover:text-black text-[hsl(var(--cocktail-text))] border-[hsl(var(--cocktail-card-border))]"
                >
                  <Wind className="h-4 w-4" />
                </Button>
                <span className="text-xs text-[hsl(var(--cocktail-text-muted))] text-center">
                  Pumpe {pump.id}
                  {pump.ingredient && <div className="text-[10px] opacity-70">{pump.ingredient}</div>}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
