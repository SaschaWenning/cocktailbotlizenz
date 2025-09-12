"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Droplets, RefreshCw, Settings } from "lucide-react"
import { VirtualKeyboard } from "./virtual-keyboard"
import { PasswordModal } from "./password-modal"
import { setCapacity, setCurrentAmount, refill, refillAll } from "@/lib/ingredient-service"
import type { IngredientLevel } from "@/lib/ingredient-store"

interface IngredientLevelsClientProps {
  initialLevels: IngredientLevel[]
}

export default function IngredientLevelsClient({ initialLevels }: IngredientLevelsClientProps) {
  const [levels, setLevels] = useState(initialLevels)
  const [pending, startTransition] = useTransition()
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [keyboardType, setKeyboardType] = useState<"capacity" | "amount">("capacity")
  const [selectedIngredient, setSelectedIngredient] = useState<string>("")
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const handleCapacityChange = (ingredientId: string, capacity: number) => {
    startTransition(async () => {
      const updatedLevels = await setCapacity(ingredientId, capacity)
      setLevels(updatedLevels)
    })
  }

  const handleAmountChange = (ingredientId: string, amount: number) => {
    startTransition(async () => {
      const updatedLevels = await setCurrentAmount(ingredientId, amount)
      setLevels(updatedLevels)
    })
  }

  const handleRefill = (ingredientId: string) => {
    startTransition(async () => {
      const updatedLevels = await refill(ingredientId)
      setLevels(updatedLevels)
    })
  }

  const handleRefillAll = () => {
    const action = () => {
      startTransition(async () => {
        const updatedLevels = await refillAll()
        setLevels(updatedLevels)
      })
    }

    setPendingAction(() => action)
    setShowPasswordModal(true)
  }

  const handlePasswordSuccess = () => {
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    }
    setShowPasswordModal(false)
  }

  const openKeyboard = (ingredientId: string, type: "capacity" | "amount") => {
    setSelectedIngredient(ingredientId)
    setKeyboardType(type)
    setShowKeyboard(true)
  }

  const handleKeyboardSubmit = (value: string) => {
    const numValue = Number.parseInt(value)
    if (!isNaN(numValue) && numValue >= 0) {
      if (keyboardType === "capacity") {
        handleCapacityChange(selectedIngredient, numValue)
      } else {
        handleAmountChange(selectedIngredient, numValue)
      }
    }
    setShowKeyboard(false)
  }

  const getPercentage = (current: number, capacity: number) => {
    return capacity > 0 ? Math.round((current / capacity) * 100) : 0
  }

  const getStatusColor = (percentage: number) => {
    if (percentage > 50) return "bg-green-500"
    if (percentage > 20) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getStatusText = (percentage: number) => {
    if (percentage > 50) return "Gut"
    if (percentage > 20) return "Niedrig"
    return "Leer"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Droplets className="h-6 w-6" />
          Füllstände
        </h2>
        <Button onClick={handleRefillAll} disabled={pending} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Alle auffüllen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map((level) => {
          const percentage = getPercentage(level.currentAmount, level.capacity)

          return (
            <Card key={level.ingredientId} className="relative">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="truncate">{level.ingredientId}</span>
                  <Badge variant={percentage > 20 ? "default" : "destructive"}>{getStatusText(percentage)}</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Füllstand</span>
                    <span>
                      {level.currentAmount}ml / {level.capacity}ml
                    </span>
                  </div>
                  <Progress value={percentage} className="h-3" />
                  <div className="text-center text-sm font-medium">{percentage}%</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Kapazität (ml)</label>
                    <Button
                      variant="outline"
                      className="w-full h-10 justify-start bg-transparent"
                      onClick={() => openKeyboard(level.ingredientId, "capacity")}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {level.capacity}ml
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Aktuell (ml)</label>
                    <Button
                      variant="outline"
                      className="w-full h-10 justify-start bg-transparent"
                      onClick={() => openKeyboard(level.ingredientId, "amount")}
                    >
                      <Droplets className="h-4 w-4 mr-2" />
                      {level.currentAmount}ml
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => handleRefill(level.ingredientId)}
                  disabled={pending}
                  className="w-full"
                  variant={percentage < 50 ? "default" : "outline"}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Auffüllen
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {showKeyboard && (
        <VirtualKeyboard
          onSubmit={handleKeyboardSubmit}
          onCancel={() => setShowKeyboard(false)}
          title={keyboardType === "capacity" ? "Kapazität eingeben (ml)" : "Füllstand eingeben (ml)"}
          placeholder="ml"
          type="number"
        />
      )}

      {showPasswordModal && (
        <PasswordModal
          onSuccess={handlePasswordSuccess}
          onCancel={() => {
            setShowPasswordModal(false)
            setPendingAction(null)
          }}
          title="Alle Behälter auffüllen"
          message="Möchten Sie wirklich alle Behälter auf 100% auffüllen?"
        />
      )}
    </div>
  )
}
