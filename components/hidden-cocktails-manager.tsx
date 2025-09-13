"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HiddenCocktailsManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleLoadHiddenCocktails = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/load-hidden-cocktails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const result = await response.json()

      if (result.success) {
        // Aktualisiere den Cache mit den geladenen Daten
        await fetch("/api/hidden-cocktails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hiddenCocktails: result.hiddenCocktails }),
        })

        setMessage(`✅ ${result.message}`)

        // Seite neu laden, um die Änderungen anzuzeigen
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setMessage(`❌ ${result.error}`)
      }
    } catch (error) {
      console.error("Fehler beim Laden der versteckten Cocktails:", error)
      setMessage("❌ Fehler beim Laden!")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveHiddenCocktails = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      // Hole aktuelle versteckte Cocktails
      const response = await fetch("/api/hidden-cocktails", {
        method: "GET",
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        const hiddenCocktails = data.hiddenCocktails || []

        // Speichere in localStorage
        localStorage.setItem("hidden-cocktails", JSON.stringify(hiddenCocktails))

        setMessage(`✅ ${hiddenCocktails.length} versteckte Cocktails gespeichert`)
      } else {
        setMessage("❌ Fehler beim Abrufen der Daten!")
      }
    } catch (error) {
      console.error("Fehler beim Speichern der versteckten Cocktails:", error)
      setMessage("❌ Fehler beim Speichern!")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Versteckte Cocktails verwalten</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleLoadHiddenCocktails} disabled={isLoading} variant="outline">
            {isLoading ? "Lade..." : "Manuell laden"}
          </Button>
          <Button onClick={handleSaveHiddenCocktails} disabled={isLoading} variant="outline">
            {isLoading ? "Speichere..." : "Manuell speichern"}
          </Button>
        </div>
        {message && <div className="text-sm font-medium">{message}</div>}
      </CardContent>
    </Card>
  )
}
