"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"
import AlphaKeyboard from "./alpha-keyboard"

interface PasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  title?: string
  message?: string
}

export function PasswordModal({ onSuccess, onCancel, title = "Passwort erforderlich", message }: PasswordModalProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (password === "cocktail") {
      setError(false)
      setPassword("")
      onSuccess()
    } else {
      setError(true)
    }
  }

  const handleKeyPress = (key: string) => {
    setPassword((prev) => prev + key)
    setError(false)
  }

  const handleBackspace = () => {
    setPassword((prev) => prev.slice(0, -1))
    setError(false)
  }

  const handleClear = () => {
    setPassword("")
    setError(false)
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="bg-black border-[hsl(var(--cocktail-card-border))] text-[hsl(var(--cocktail-text))] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {message && <p className="text-sm text-gray-400 mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Bitte gib das Passwort ein:</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`bg-[hsl(var(--cocktail-bg))] border-[hsl(var(--cocktail-card-border))] ${error ? "border-[hsl(var(--cocktail-error))]" : ""}`}
              placeholder="Passwort eingeben"
              autoComplete="off"
              readOnly
              onFocus={() => setShowKeyboard(true)}
            />
            {error && (
              <p className="text-[hsl(var(--cocktail-error))] text-sm">Falsches Passwort. Bitte versuche es erneut.</p>
            )}
          </div>

          {showKeyboard && (
            <div className="mt-4">
              <AlphaKeyboard
                onKeyPress={handleKeyPress}
                onBackspace={handleBackspace}
                onClear={handleClear}
                onConfirm={handleSubmit}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              className="bg-[hsl(var(--cocktail-card-bg))] text-white border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))]"
              onClick={onCancel}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="bg-[hsl(var(--cocktail-primary))] text-black hover:bg-[hsl(var(--cocktail-primary-hover))]"
            >
              Bestätigen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function PasswordModalWrapper({
  isOpen,
  onClose,
  onSuccess,
}: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  if (!isOpen) return null
  return <PasswordModal onSuccess={onSuccess} onCancel={onClose} />
}
