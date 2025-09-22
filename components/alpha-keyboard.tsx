"use client"

import { Button } from "@/components/ui/button"
import { Backpack as Backspace, X, Check } from "lucide-react"

interface AlphaKeyboardProps {
  onKeyPress: (key: string) => void
  onBackspace: () => void
  onClear: () => void
  onConfirm: () => void
}

export default function AlphaKeyboard({ onKeyPress, onBackspace, onClear, onConfirm }: AlphaKeyboardProps) {
  // Erste Reihe: q bis p (10 Tasten)
  const row1 = ["q", "w", "e", "r", "t", "z", "u", "i", "o", "p"]
  // Zweite Reihe: a bis l (9 Tasten)
  const row2 = ["a", "s", "d", "f", "g", "h", "j", "k", "l"]
  // Dritte Reihe: y bis m (7 Tasten) - y und z vertauscht für deutsches Layout
  const row3 = ["y", "x", "c", "v", "b", "n", "m"]

  return (
    <div className="bg-black border border-[hsl(var(--cocktail-card-border))] rounded-lg p-3 shadow-lg max-w-2xl mx-auto">
      {/* Erste Reihe - 10 Tasten */}
      <div className="grid grid-cols-10 gap-2 mb-2">
        {row1.map((key) => (
          <Button
            key={key}
            className="h-12 text-lg font-medium bg-[hsl(var(--cocktail-card-bg))] text-white border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))] hover:text-[hsl(var(--cocktail-primary))] transition-colors"
            onClick={() => onKeyPress(key)}
          >
            {key.toUpperCase()}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-10 gap-2 mb-2">
        <div className="col-span-1"></div>
        {row2.map((key) => (
          <Button
            key={key}
            className="h-12 text-lg font-medium bg-[hsl(var(--cocktail-card-bg))] text-white border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))] hover:text-[hsl(var(--cocktail-primary))] transition-colors"
            onClick={() => onKeyPress(key)}
          >
            {key.toUpperCase()}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-10 gap-2 mb-3">
        <div className="col-span-1"></div>
        <div className="col-span-1"></div>
        {row3.map((key) => (
          <Button
            key={key}
            className="h-12 text-lg font-medium bg-[hsl(var(--cocktail-card-bg))] text-white border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))] hover:text-[hsl(var(--cocktail-primary))] transition-colors"
            onClick={() => onKeyPress(key)}
          >
            {key.toUpperCase()}
          </Button>
        ))}
        <div className="col-span-1"></div>
      </div>

      <div className="grid grid-cols-10 gap-2 mb-3">
        <div className="col-span-2"></div>
        <Button
          className="col-span-6 h-12 text-lg font-medium bg-[hsl(var(--cocktail-card-bg))] text-white border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))] hover:text-[hsl(var(--cocktail-primary))] transition-colors"
          onClick={() => onKeyPress(" ")}
        >
          LEERZEICHEN
        </Button>
        <div className="col-span-2"></div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Button
          className="h-12 text-lg font-medium text-[hsl(var(--cocktail-error))] bg-[hsl(var(--cocktail-card-bg))] border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-error))]/20 transition-colors"
          onClick={onClear}
        >
          <X className="h-5 w-5 mr-1" />
          Löschen
        </Button>

        <Button
          className="h-12 text-lg font-medium bg-[hsl(var(--cocktail-card-bg))] text-white border-[hsl(var(--cocktail-card-border))] hover:bg-[hsl(var(--cocktail-card-border))] transition-colors"
          onClick={onBackspace}
        >
          <Backspace className="h-5 w-5 mr-1" />
          Zurück
        </Button>

        <Button
          className="col-span-2 h-12 text-lg font-medium bg-[hsl(var(--cocktail-primary))] text-black hover:bg-[hsl(var(--cocktail-primary-hover))] transition-colors"
          onClick={onConfirm}
        >
          <Check className="h-5 w-5 mr-2" />
          Bestätigen
        </Button>
      </div>
    </div>
  )
}
