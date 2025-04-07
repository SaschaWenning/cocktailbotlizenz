"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { PumpConfig } from "@/types/pump"
import { savePumpConfig, calibratePump } from "@/lib/cocktail-machine"
import { ingredients } from "@/data/ingredients"
import { Loader2, Beaker, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PumpCalibrationProps {
  pumpConfig: PumpConfig[]
}

export default function PumpCalibration({ pumpConfig: initialConfig }: PumpCalibrationProps) {
  const [pumpConfig, setPumpConfig] = useState<PumpConfig[]>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [calibrating, setCalibrating] = useState<number | null>(null)
  const [measuredAmount, setMeasuredAmount] = useState<string>("")
  const [calibrationStep, setCalibrationStep] = useState<"idle" | "measuring" | "input">("idle")
  const [currentPumpId, setCurrentPumpId] = useState<number | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleIngredientChange = (pumpId: number, ingredient: string) => {
    setPumpConfig((prev) => prev.map((pump) => (pump.id === pumpId ? { ...pump, ingredient } : pump)))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await savePumpConfig(pumpConfig)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      // Fehler-Handling hier
    } finally {
      setSaving(false)
    }
  }

  const startCalibration = async (pumpId: number) => {
    setCurrentPumpId(pumpId)
    setCalibrationStep("measuring")
    setCalibrating(pumpId)

    try {
      // Pumpe für genau 2 Sekunden laufen lassen
      await calibratePump(pumpId, 2000)
      setCalibrationStep("input")
    } catch (error) {
      // Fehler-Handling hier
      setCalibrationStep("idle")
    } finally {
      setCalibrating(null)
    }
  }

  const handleMeasuredAmountChange = (value: string) => {
    // Nur Zahlen und einen Dezimalpunkt erlauben
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setMeasuredAmount(value)
    }
  }

  const saveCalibration = () => {
    if (currentPumpId === null || measuredAmount === "") return

    const amount = Number.parseFloat(measuredAmount)
    if (isNaN(amount) || amount <= 0) return

    // Berechne die Durchflussrate (ml/s) basierend auf der gemessenen Menge und 2 Sekunden Laufzeit
    const flowRate = amount / 2

    setPumpConfig((prev) => prev.map((pump) => (pump.id === currentPumpId ? { ...pump, flowRate } : pump)))

    // Zurücksetzen
    setMeasuredAmount("")
    setCalibrationStep("idle")
    setCurrentPumpId(null)
  }

  const cancelCalibration = () => {
    setMeasuredAmount("")
    setCalibrationStep("idle")
    setCurrentPumpId(null)
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white border-[hsl(var(--cocktail-card-border))]">
        <CardHeader>
          <CardTitle>CocktailBot Pumpenkalibrierung</CardTitle>
          <CardDescription>
            Kalibriere jede Pumpe, indem du sie für 2 Sekunden laufen lässt, die geförderte Menge in ml misst und den
            Wert einträgst.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {calibrationStep === "measuring" && (
            <Alert className="mb-4 bg-[hsl(var(--cocktail-accent))]/10 border-[hsl(var(--cocktail-accent))]/30">
              <Beaker className="h-4 w-4 text-[hsl(var(--cocktail-accent))]" />
              <AlertDescription className="text-[hsl(var(--cocktail-text))]">
                Pumpe {currentPumpId} läuft für 2 Sekunden. Bitte stelle ein Messgefäß bereit und miss die geförderte
                Menge in ml.
              </AlertDescription>
            </Alert>
          )}

          {calibrationStep === "input" && (
            <div className="mb-4 p-4 border border-[hsl(var(--cocktail-accent))]/30 rounded-lg bg-[hsl(var(--cocktail-accent))]/10">
              <h3 className="text-sm font-medium mb-2 text-[hsl(var(--cocktail-text))]">
                Gemessene Menge für Pumpe {currentPumpId} eintragen:
              </h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={measuredAmount}
                    onChange={(e) => handleMeasuredAmountChange(e.target.value)}
                    placeholder="Menge in ml"
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={saveCalibration}
                  variant="outline"
                  className="bg-[hsl(var(--cocktail-accent))]/10 border-[hsl(var(--cocktail-accent))]/30"
                >
                  Speichern
                </Button>
                <Button onClick={cancelCalibration} variant="ghost">
                  Abbrechen
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {pumpConfig.map((pump) => (
              <div key={pump.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1">
                  <span className="font-medium">{pump.id}</span>
                </div>

                <div className="col-span-5">
                  <Select
                    value={pump.ingredient}
                    onValueChange={(value) => handleIngredientChange(pump.id, value)}
                    disabled={calibrationStep !== "idle"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Zutat wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredients.map((ingredient) => (
                        <SelectItem key={ingredient.id} value={ingredient.id}>
                          {ingredient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={pump.flowRate.toFixed(1)}
                      readOnly
                      className="w-full bg-[hsl(var(--cocktail-bg))]"
                    />
                    <span className="text-xs whitespace-nowrap">ml/s</span>
                  </div>
                </div>

                <div className="col-span-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => startCalibration(pump.id)}
                    disabled={calibrationStep !== "idle" || calibrating !== null}
                  >
                    {calibrating === pump.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kalibrieren"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full mt-6" onClick={handleSave} disabled={saving || calibrationStep !== "idle"}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Konfiguration speichern
              </>
            )}
          </Button>

          {showSuccess && (
            <Alert className="mt-4 bg-[hsl(var(--cocktail-success))]/10 border-[hsl(var(--cocktail-success))]/30">
              <AlertDescription className="text-[hsl(var(--cocktail-success))]">
                Pumpenkonfiguration erfolgreich gespeichert!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

